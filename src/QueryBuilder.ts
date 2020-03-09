/* eslint-disable no-useless-constructor */
/* eslint-disable @typescript-eslint/no-empty-function */
import { BaseClient, Node } from "./BaseClient";
import { QueryHeader, ResponseType } from "./generated/QueryHeader_pb";
import { Query } from "./generated/Query_pb";
import { Response } from "./generated/Response_pb";
import { HederaStatusError } from "./errors/HederaStatusError";
import { MaxQueryPaymentExceededError } from "./errors/MaxQueryPaymentExceededError";
import { runValidation, setTimeoutAwaitable, timeoutPromise } from "./util";
import { grpc } from "@improbable-eng/grpc-web";
import { Hbar, Tinybar, hbarFromTinybarOrHbar, hbarCheck } from "./Hbar";
import { ResponseHeader } from "./generated/ResponseHeader_pb";
import { TransactionBody } from "./generated/TransactionBody_pb";
import { AccountId } from "./account/AccountId";
import { Status } from "./Status";
import { HederaPrecheckStatusError } from "./errors/HederaPrecheckStatusError";

export abstract class QueryBuilder<T> {
    protected readonly _inner: Query = new Query();

    private _maxPaymentAmount: Hbar | null = null;

    private _paymentAmount: Hbar | null = null;

    private _transactionId: import("./TransactionId").TransactionId | null = null;

    protected constructor() {
    }

    public setMaxQueryPayment(amount: Tinybar | Hbar): this {
        const hbar = hbarFromTinybarOrHbar(amount);
        hbar[ hbarCheck ]({ allowNegative: false });

        this._maxPaymentAmount = hbar;
        return this;
    }

    public setQueryPayment(amount: Tinybar | Hbar): this {
        const hbar = hbarFromTinybarOrHbar(amount);
        hbar[ hbarCheck ]({ allowNegative: false });

        this._paymentAmount = hbar;

        return this;
    }

    /**
     * Set a manually created and signed
     * `CryptoTransferTransaction` as the query payment.
     */
    public setQueryPaymentTransaction(transaction: import("./Transaction").Transaction): this {
        this._transactionId = transaction.id;
        this._getHeader().setPayment(transaction._toProto());

        return this;
    }

    public async getCost(client: BaseClient): Promise<Hbar> {
        // HACK: Async import because otherwise there would a cycle in the imports which breaks everything
        const { CryptoTransferTransaction } = await import("./account/CryptoTransferTransaction");

        // Skip payment validation and just run general validation
        this._localValidate(false);

        const queryHeader = this._getHeader();

        // Store the current response type and payment
        // from the polymorphic query header
        const currentResponseType = queryHeader.getResponsetype();
        const currentPayment = queryHeader.getPayment();

        try {
            // Pick a node for us to use
            const node = client._randomNode();

            // COST_ANSWER tells HAPI to return only the cost for the query body
            queryHeader.setResponsetype(ResponseType.COST_ANSWER);

            // COST_ANSWER requires a "null" payment but does not actually
            // process it
            const transaction = new CryptoTransferTransaction()
                .addRecipient(node.id, 0)
                .addSender(client._getOperatorAccountId()!, 0)
                .build(client);

            this._transactionId = transaction.id;

            queryHeader.setPayment((await transaction
                .signWith(client._getOperatorKey()!, client._getOperatorSigner()!))
                ._toProto());

            const resp = await client._unaryCall(node.url, this._inner.clone(), this._getMethod());

            const respHeader = this._mapResponseHeader(resp);

            HederaPrecheckStatusError._throwIfError(
                respHeader.getNodetransactionprecheckcode(),
                this._transactionId
            );

            return Hbar.fromTinybar(respHeader.getCost());
        } finally {
            // Reset the response type and payment transaction
            // on the query header
            queryHeader.setResponsetype(currentResponseType);
            queryHeader.setPayment(currentPayment);
        }
    }

    public execute(client: BaseClient): Promise<T> {
        let respStatus: Status | null = null;

        return timeoutPromise(this._getDefaultExecuteTimeout(), (async() => {
            let node: Node;

            if (this._isPaymentRequired()) {
                if (this._getHeader().hasPayment()) {
                    const paymentTxBodyBytes = this._getHeader().getPayment()!.getBodybytes_asU8();
                    const paymentTxBody = TransactionBody.deserializeBinary(paymentTxBodyBytes);

                    const nodeId = AccountId._fromProto(paymentTxBody.getNodeaccountid()!);

                    node = client._getNode(nodeId);
                } else if (this._paymentAmount != null) {
                    node = client._randomNode();

                    await this._generatePaymentTransaction(client, node, this._paymentAmount);
                } else if (this._maxPaymentAmount != null || client._maxQueryPayment != null) {
                    node = client._randomNode();

                    const maxPaymentAmount: Hbar = this._maxPaymentAmount == null ?
                        client._maxQueryPayment! :
                        this._maxPaymentAmount;

                    const actualCost = await this.getCost(client);

                    if (actualCost.isGreaterThan(maxPaymentAmount)) {
                        throw new MaxQueryPaymentExceededError(actualCost, maxPaymentAmount);
                    }

                    await this._generatePaymentTransaction(client, node, actualCost);
                }
            } else {
                node = client._randomNode();
            }

            // Run validator (after we have set the payment)
            this._localValidate();

            for (let attempt = 0; /* this will timeout by [timeoutPromise] */ ; attempt += 1) {
                if (attempt > 0) {
                    // Wait a bit before the next call if this is not our first rodeo
                    const delayMs = Math.floor(500 * Math.random() * ((2 ** attempt) - 1));
                    await setTimeoutAwaitable(delayMs);
                }

                const resp = await client._unaryCall(node!.url, this._inner, this._getMethod());
                respStatus = Status._fromCode(this._mapResponseHeader(resp)
                    .getNodetransactionprecheckcode());

                if (this._shouldRetry(respStatus, resp)) {
                    continue;
                }

                HederaPrecheckStatusError._throwIfError(
                    respStatus.code,
                    this._transactionId!
                );

                return this._mapResponse(resp);
            }
        })(), (reject) => {
            if (respStatus == null) {
                // Timed out before we executed ??
                reject(new Error("timed out"));
            } else {
                // We executed at least once
                reject(new HederaStatusError(respStatus));
            }
        });
    }

    public _toProto(): Query {
        return this._inner;
    }

    protected abstract _getMethod(): grpc.UnaryMethodDefinition<Query, Response>;

    protected abstract _getHeader(): QueryHeader;

    protected abstract _mapResponseHeader(response: Response): ResponseHeader;

    protected abstract _mapResponse(response: Response): T;

    protected abstract _doLocalValidate(errors: string[]): void;

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    protected _shouldRetry(status: Status, response: Response): boolean {
        // By deafult, ONLY the BUSY status should be retriesd
        return status.code === Status.Busy.code;
    }

    protected _getDefaultExecuteTimeout(): number {
        return 20000; // 20s
    }

    protected _isPaymentRequired(): boolean {
        // Nearly all queries require a payment
        return true;
    }

    private _localValidate(checkPayment = true): void {
        runValidation(this, (errors) => {
            if (checkPayment && this._isPaymentRequired() && !this._getHeader().hasPayment()) {
                errors.push("one of `.setPayment()` or `.setPaymentAmount()` is required");
            }

            this._doLocalValidate(errors);
        });
    }

    public async _generatePaymentTransaction(
        client: BaseClient,
        node: Node,
        amount: Tinybar | Hbar
    ): Promise<this> {
        const hbar = hbarFromTinybarOrHbar(amount);
        hbar[ hbarCheck ]({ allowNegative: false });

        // HACK: Async import because otherwise there would a cycle in the imports which breaks everything
        const { CryptoTransferTransaction } = await import("./account/CryptoTransferTransaction");

        const paymentTx = await new CryptoTransferTransaction()
            .setNodeAccountId(node.id)
            .addRecipient(node.id, hbar)
            .addSender(client._getOperatorAccountId()!, hbar)
            .setMaxTransactionFee(new Hbar(1))
            .build(client)
            .signWith(client._getOperatorKey()!, client._getOperatorSigner()!);

        this.setQueryPaymentTransaction(paymentTx);

        return this;
    }
}
