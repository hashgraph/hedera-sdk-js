import {BaseClient, getNode, Node, randomNode} from "./BaseClient";
import {TransactionBody} from "./generated/TransactionBody_pb";
import {getProtoAccountId, getProtoTxnId, newDuration, newTxnId} from "./util";
import {newTxn, Transaction} from "./Transaction";
import {Transaction as Transaction_} from "./generated/Transaction_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {TransactionResponse} from "./generated/TransactionResponse_pb";
import BigNumber from "bignumber.js";

import {AccountId, TransactionId} from "./typedefs";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;

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
    }

    public setTransactionId(id: TransactionId): this {
        this.inner.setTransactionid(getProtoTxnId(id));
        return this;
    }

    public setTransactionValidDuration(seconds: number): this {
        this.inner.setTransactionvalidduration(newDuration(Math.min(seconds, maxValidDuration)));
        return this;
    }

    public setTransactionFee(fee: number | BigNumber): this {
        this.inner.setTransactionfee(String(fee));
        return this;
    }

    public setNodeAccountId(nodeAccountId: AccountId): this {
        this.nodeAccountId = nodeAccountId;
        this.inner.setNodeaccountid(getProtoAccountId(nodeAccountId));
        return this;
    }

    public setMemo(memo: string): this {
        this.inner.setMemo(memo);
        return this;
    }

    public abstract get method(): UnaryMethodDefinition<Transaction_, TransactionResponse>;

    protected abstract doValidate(): void;

    protected getNode(): Node {
        if (!this.node) {
            this.node = this.nodeAccountId
                ? this.client[getNode](this.nodeAccountId)
                : this.client[randomNode]();
        }

        return this.node;
    }

    public validate(): void {
        if (!this.inner.hasTransactionid()) {
            throw new Error('missing ID for transaction');
        }

        if (this.inner.getTransactionfee() === '0') {
            throw new Error('Every transaction requires setTransactionFee(). '
                + 'This is only a maximum; the actual fee assessed may be lower.')
        }

        // strings are UTF-16, max 100 bytes
        if (this.inner.getMemo().length * 2 > 100) {
            throw new Error('memo may not be longer than 100 bytes');
        }

        this.doValidate();
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

        return Transaction[newTxn](this.client, url, txn, this.inner, this.method);
    }
}
