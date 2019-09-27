import {BaseClient, Node} from "./BaseClient";
import {TransactionBody} from "./generated/TransactionBody_pb";
import {
    getProtoAccountId,
    getProtoTxnId,
    newDuration,
    newTxnId,
    normalizeAccountId,
    runValidation,
    tinybarToString
} from "./util";
import {Transaction} from "./Transaction";
import {Transaction as Transaction_} from "./generated/Transaction_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {TransactionResponse} from "./generated/TransactionResponse_pb";

import {AccountId, AccountIdLike, Tinybar, TransactionIdLike} from "./typedefs";
import {Hbar} from "./Hbar";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;

/**
 * Max duration of transactions on the network is 2 minutes
 */
const maxValidDuration = 120;

export abstract class TransactionBuilder {
    private _client: BaseClient;
    private _nodeAccountId?: AccountId;
    protected readonly _inner: TransactionBody;

    private _node?: Node;

    protected constructor (client: BaseClient) {
        this._client = client;
        this._inner = new TransactionBody();
        this._inner.setTransactionvalidduration(newDuration(120));
        this._inner.setTransactionfee(tinybarToString(this._client.maxTransactionFee));
    }

    public setTransactionId(id: TransactionIdLike): this {
        this._inner.setTransactionid(getProtoTxnId(id));
        return this;
    }

    public setTransactionValidDuration(seconds: number): this {
        this._inner.setTransactionvalidduration(newDuration(Math.min(seconds, maxValidDuration)));
        return this;
    }

    public setTransactionFee(fee: Tinybar | Hbar): this {
        this._inner.setTransactionfee(tinybarToString(fee));
        return this;
    }

    public setNodeAccountId(nodeAccountId: AccountIdLike): this {
        this._nodeAccountId = normalizeAccountId(nodeAccountId);
        this._inner.setNodeaccountid(getProtoAccountId(nodeAccountId));
        return this;
    }

    public setMemo(memo: string): this {
        this._inner.setMemo(memo);
        return this;
    }

    public abstract get _method(): UnaryMethodDefinition<Transaction_, TransactionResponse>;

    protected abstract _doValidate(errors: string[]): void;

    protected _getNode(): Node {
        if (!this._node) {
            this._node = this._nodeAccountId
                ? this._client._getNode(this._nodeAccountId)
                : this._client._randomNode();
        }

        return this._node;
    }

    public validate(): void {
        runValidation(this, (errors => {
            if (!this._inner.hasTransactionid()) {
                errors.push('missing ID for transaction');
            }

            if (this._inner.getTransactionfee() === '0') {
                errors.push('Every transaction requires setTransactionFee(). '
                    + 'This is only a maximum; the actual fee assessed may be lower.')
            }

            // strings are UTF-16, max 100 bytes
            if (this._inner.getMemo().length * 2 > 100) {
                errors.push('memo may not be longer than 100 bytes');
            }

            this._doValidate(errors);
        }));
    }

    public build(): Transaction {
        if (!this._inner.hasTransactionid()) {
            this._inner.setTransactionid(newTxnId(this._client.operator.account));
        }

        if (!this._inner.hasTransactionvalidduration()) {
            this.setTransactionValidDuration(maxValidDuration);
        }

        const [url, nodeAccountID] = this._getNode();
        if (!this._inner.hasNodeaccountid()) {
            this.setNodeAccountId(nodeAccountID);
        }

        this.validate();

        const txn = new Transaction_();
        txn.setBodybytes(this._inner.serializeBinary());

        return new Transaction(this._client, url, txn, this._inner, this._method);
    }
}
