import {Client, TransactionId} from "./Client";
import {TransactionBody} from "./generated/TransactionBody_pb";
import {getProtoTxnId, newDuration, newTxnId} from "./util";
import Transaction from "./Transaction";
import {Transaction as Transaction_} from "./generated/Transaction_pb";
import {Method} from "google-protobuf/google/protobuf/api_pb";
import {grpc} from "@improbable-eng/grpc-web";
import MethodDefinition = grpc.MethodDefinition;
import {TransactionResponse} from "./generated/TransactionResponse_pb";

/**
 * Max duration of transactions on the network is 2 minutes
 */
const maxValidDuration = 120;

export abstract class TransactionBuilder {
    private client: Client;
    protected readonly inner: TransactionBody;

    protected constructor (client: Client) {
        this.client = client;
        this.inner = new TransactionBody();
    }

    setTransactionId(id: TransactionId): this {
        this.inner.setTransactionid(getProtoTxnId(id));
        return this;
    }

    setTransactionValidDuration(seconds: number): this {
        this.inner.setTransactionvalidduration(newDuration(Math.min(seconds, maxValidDuration)));
        return this;
    }

    setTransactionFee(fee: number): this {
        this.inner.setTransactionfee(fee);
        return this;
    }

    abstract get method(): MethodDefinition<Transaction_, TransactionResponse>;

    build(): Transaction {
        if (!this.inner.hasTransactionid()) {
            this.inner.setTransactionid(newTxnId(this.client.operator.account));
        }

        if (!this.inner.hasTransactionvalidduration()) {
            this.setTransactionValidDuration(maxValidDuration);
        }

        const txn = new Transaction_();
        txn.setBodybytes(this.inner.serializeBinary());

        return new Transaction(this.client, txn, this.inner, this.method);
    }
}
