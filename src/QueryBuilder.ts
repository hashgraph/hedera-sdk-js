import { BaseClient, Node } from "./BaseClient";
import { QueryHeader, ResponseType } from "./generated/QueryHeader_pb";
import { Query } from "./generated/Query_pb";
import { Response } from "./generated/Response_pb";
import { MaxPaymentExceededException, throwIfExceptional } from "./errors";
import { getResponseHeader, runValidation } from "./util";
import { grpc } from "@improbable-eng/grpc-web";
import { CryptoTransferTransaction } from "./account/CryptoTransferTransaction";
import { Transaction } from "./generated/Transaction_pb";
import { Hbar } from "./Hbar";
import { Tinybar } from "./types/Tinybar";

export abstract class QueryBuilder<T> {
    private readonly _client: BaseClient;
    protected readonly _inner: Query;

    private readonly _header: QueryHeader;

    protected readonly _needsPayment: boolean;

    private _node?: Node;

    protected constructor(client: BaseClient, header: QueryHeader) {
        this._client = client;
        this._inner = new Query();
        this._header = header;
        this._needsPayment = true;
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
        const [ , nodeAccountId ] = this._getNode();

        const payment = new CryptoTransferTransaction(this._client)
            .setNodeAccountId(nodeAccountId)
            .addRecipient(nodeAccountId, amount)
            .addSender(this._client.operator.account, amount)
            .setTransactionFee(Hbar.of(1))
            .build();

        await payment.signWith(this._client.operatorPublicKey, this._client.operatorSigner);

        this._header.setPayment(payment.toProto());

        return this;
    }

    /**
     * Set a manually created and signed `CryptoTransferTransaction` as the query payment.
     */
    public setPayment(transaction: Transaction): this {
        this._header.setPayment(transaction);
        return this;
    }

    protected abstract _doValidate(errors: string[]): void;

    public validate(): void {
        runValidation(this, (errors) => {
            if (!this._header.hasPayment()) {
                errors.push("`.setPayment()` required");
            }

            this._prepaymentValidate(errors);
        });
    }

    private _prepaymentValidate(errors: string[]): void {
        this._doValidate(errors);
    }

    /**
     * Request the cost of this query in HBAR from the node.
     *
     * You can then attach a payment for this value with `.setPaymentDefault()`.
     */
    public async requestCost(): Promise<Hbar> {
        runValidation(this, (errors) => this._prepaymentValidate(errors));

        // create a duplicate of the query with `COST_ANSWER` instead of the original response type
        // we also must have a signed payment of 0 hbar which is not actually processed
        const responseType = this._header.getResponsetype();
        this._header.setResponsetype(ResponseType.COST_ANSWER);

        const payment = this._header.getPayment();
        await this.setPaymentDefault(0);

        const query = this._inner.clone() as Query;

        this._header.setResponsetype(responseType);
        this._header.setPayment(payment);

        const [ url ] = this._getNode();

        const response = await this._client._unaryCall(url, query, this._method);

        const responseHeader = getResponseHeader(response);
        throwIfExceptional(responseHeader.getNodetransactionprecheckcode());

        return Hbar.fromTinybar(responseHeader.getCost());
    }

    private _getNode(): Node {
        if (!this._node) {
            this._node = this._client._randomNode();
        }

        return this._node;
    }

    public async execute(): Promise<T> {
        const [ nodeUrl ] = this._getNode();

        if (this._client.maxQueryPayment && this._needsPayment && !this._header.hasPayment()) {
            const cost = await this.requestCost();

            if (this._client.maxQueryPayment.comparedTo(cost) < 0) {
                throw new MaxPaymentExceededException(cost, this._client.maxQueryPayment);
            }

            await this.setPaymentDefault(cost);
        }

        this.validate();

        const response = await this._client._unaryCall(nodeUrl, this._inner, this._method);

        const responseHeader = getResponseHeader(response);
        throwIfExceptional(responseHeader.getNodetransactionprecheckcode());

        return this._mapResponse(response);
    }

    public toProto(): Query {
        return this._inner;
    }

    protected abstract get _method(): grpc.UnaryMethodDefinition<Query, Response>;

    protected abstract _mapResponse(response: Response): T;
}
