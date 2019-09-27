import {BaseClient, Node} from "./BaseClient";
import {TransactionBody} from "./generated/TransactionBody_pb";
import {
    newDuration,
    runValidation,
} from "./util";
import {Transaction} from "./Transaction";
import {Transaction as Transaction_} from "./generated/Transaction_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {TransactionResponse} from "./generated/TransactionResponse_pb";

import {Tinybar, tinybarToString} from "./types/Tinybar";
import {Hbar} from "./Hbar";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import {AccountId, AccountIdLike, accountIdToProto, normalizeAccountId} from "./types/AccountId";
import {getProtoTxnId, newTxnId, TransactionIdLike} from "./types/TransactionId";

/**
 * Max duration of transactions on the network is 2 minutes
 */
const maxValidDuration = 120;

export abstract class TransactionBuilder {
    private client: BaseClient;
    private nodeAccountId?: AccountId;
    protected readonly inner: TransactionBody;

    private node?: Node;

    protected constructor (client: BaseClient) {
        this.client = client;
        this.inner = new TransactionBody();
        this.inner.setTransactionvalidduration(newDuration(120));
        this.inner.setTransactionfee(tinybarToString(this.client.maxTransactionFee));
    }

    public setTransactionId(id: TransactionIdLike): this {
        this.inner.setTransactionid(getProtoTxnId(id));
        return this;
    }

    public setTransactionValidDuration(seconds: number): this {
        this.inner.setTransactionvalidduration(newDuration(Math.min(seconds, maxValidDuration)));
        return this;
    }

    public setTransactionFee(fee: Tinybar | Hbar): this {
        this.inner.setTransactionfee(tinybarToString(fee));
        return this;
    }

    public setNodeAccountId(nodeAccountId: AccountIdLike): this {
        this.nodeAccountId = normalizeAccountId(nodeAccountId);
        this.inner.setNodeaccountid(accountIdToProto(nodeAccountId));
        return this;
    }

    public setMemo(memo: string): this {
        this.inner.setMemo(memo);
        return this;
    }

    public abstract get method(): UnaryMethodDefinition<Transaction_, TransactionResponse>;

    protected abstract doValidate(errors: string[]): void;

    protected getNode(): Node {
        if (!this.node) {
            this.node = this.nodeAccountId
                ? this.client._getNode(this.nodeAccountId)
                : this.client._randomNode();
        }

        return this.node;
    }

    public validate(): void {
        runValidation(this, (errors => {
            if (!this.inner.hasTransactionid()) {
                errors.push('missing ID for transaction');
            }

            if (this.inner.getTransactionfee() === '0') {
                errors.push('Every transaction requires setTransactionFee(). '
                    + 'This is only a maximum; the actual fee assessed may be lower.')
            }

            // strings are UTF-16, max 100 bytes
            if (this.inner.getMemo().length * 2 > 100) {
                errors.push('memo may not be longer than 100 bytes');
            }

            this.doValidate(errors);
        }));
    }

    public build(): Transaction {
        if (!this.inner.hasTransactionid()) {
            this.inner.setTransactionid(newTxnId(this.client.operator.account));
        }

        if (!this.inner.hasTransactionvalidduration()) {
            this.setTransactionValidDuration(maxValidDuration);
        }

        const [url, nodeAccountID] = this.getNode();
        if (!this.inner.hasNodeaccountid()) {
            this.setNodeAccountId(nodeAccountID);
        }

        this.validate();

        const txn = new Transaction_();
        txn.setBodybytes(this.inner.serializeBinary());

        return new Transaction(this.client, url, txn, this.inner, this.method);
    }
}
