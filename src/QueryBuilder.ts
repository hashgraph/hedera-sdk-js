import {BaseClient, Node} from "./BaseClient";
import {QueryHeader, ResponseType} from "./generated/QueryHeader_pb";
import {Query} from "./generated/Query_pb";
import {Response} from "./generated/Response_pb";
import {MaxPaymentExceededException, throwIfExceptional} from "./errors";
import {getResponseHeader, runValidation} from "./util";
import {grpc} from "@improbable-eng/grpc-web";
import {CryptoTransferTransaction} from "./account/CryptoTransferTransaction";
import {Transaction} from "./generated/Transaction_pb";
import {Hbar} from "./Hbar";
import {Tinybar} from "./types/Tinybar";

export abstract class QueryBuilder<T> {
    private readonly client: BaseClient;
    protected readonly inner: Query;

    private readonly header: QueryHeader;

    protected readonly needsPayment: boolean;

    private node?: Node;

    protected constructor(client: BaseClient, header: QueryHeader) {
        this.client = client;
        this.inner = new Query();
        this.header = header;
        this.needsPayment = true;
    }

    /**
     * Attach a signed payment from the operator account for the given amount.
     *
     * Note that unlike transaction fees, this is an exact payment which will be deducted
     * from the operator account. You probably want to use `.requestCost()` to get the actual
     * cost of the query from the network.
     *
     * @throws TinybarValueError if the value is out of range for the protocol
     */
    public async setPaymentDefault(amount: Tinybar | Hbar): Promise<this> {
        const [,nodeAccountId] = this.getNode();

        const payment = new CryptoTransferTransaction(this.client)
            .setNodeAccountId(nodeAccountId)
            .addRecipient(nodeAccountId, amount)
            .addSender(this.client.operator.account, amount)
            .setTransactionFee(Hbar.of(1))
            .build();

        await payment.signWith(this.client.operatorPublicKey, this.client.operatorSigner);

        this.header.setPayment(payment.toProto());

        return this;
    }

    /**
     * Set a manually created and signed `CryptoTransferTransaction` as the query payment.
     */
    public setPayment(transaction: Transaction): this {
        this.header.setPayment(transaction);
        return this;
    }

    protected abstract doValidate(errors: string[]): void;

    public validate(): void {
        runValidation(this, (errors) => {
            if (!this.header.hasPayment()) {
                errors.push('`.setPayment()` required');
            }

            this.prepaymentValidate(errors);
        });
    }

    private prepaymentValidate(errors: string[]): void {
        this.doValidate(errors);
    }

    /**
     * Request the cost of this query in HBAR from the node.
     *
     * You can then attach a payment for this value with `.setPaymentDefault()`.
     */
    public async requestCost(): Promise<Hbar> {
        runValidation(this, (errors) => this.prepaymentValidate(errors));

        // create a duplicate of the query with `COST_ANSWER` instead of the original response type
        // we also must have a signed payment of 0 hbar which is not actually processed
        const responseType = this.header.getResponsetype();
        this.header.setResponsetype(ResponseType.COST_ANSWER);

        const payment = this.header.getPayment();
        await this.setPaymentDefault(0);

        const query = this.inner.clone() as Query;

        this.header.setResponsetype(responseType);
        this.header.setPayment(payment);

        const [url] = this.getNode();

        const response = await this.client._unaryCall(url, query, this.getMethod());

        const responseHeader = getResponseHeader(response);
        throwIfExceptional(responseHeader.getNodetransactionprecheckcode());

        return Hbar.fromTinybar(responseHeader.getCost());
    }

    private getNode(): Node {
        if (!this.node) {
            this.node = this.client._randomNode();
        }

        return this.node;
    }

    public async execute(): Promise<T> {
        const [nodeUrl] = this.getNode();

        if (this.client.maxQueryPayment && this.needsPayment && !this.header.hasPayment()) {
            const cost = await this.requestCost();

            if (this.client.maxQueryPayment.comparedTo(cost) < 0) {
                throw new MaxPaymentExceededException(cost, this.client.maxQueryPayment);
            }

            await this.setPaymentDefault(cost);
        }

        this.validate();

        const response = await this.client._unaryCall(nodeUrl, this.inner, this.getMethod());

        const responseHeader = getResponseHeader(response);
        throwIfExceptional(responseHeader.getNodetransactionprecheckcode());

        return this.mapResponse(response);
    }

    public toProto(): Query {
        return this.inner;
    }

    protected abstract getMethod(): grpc.UnaryMethodDefinition<Query, Response>;

    protected abstract mapResponse(response: Response): T;
}
