import {
    AccountId,
    AccountIdLike
} from "./account/AccountId";
import { TransactionID } from "./generated/BasicTypes_pb";
import { orThrow } from "./util";
import { Timestamp } from "./generated/Timestamp_pb";
import { dateToTimestamp } from "./Timestamp";

/**
 * Normalized transaction ID returned by various methods in the SDK.
 */

export class TransactionId {
    public account: AccountId;
    public validStartSeconds: number;
    public validStartNanos: number;

    public constructor(transactionId: TransactionIdLike) {
        this.account = new AccountId(transactionId.account);

        if ("validStart" in transactionId) {
            const { seconds, nanos } = dateToTimestamp(transactionId.validStart);

            this.validStartSeconds = seconds;
            this.validStartNanos = nanos;
        } else {
            this.validStartSeconds = transactionId.validStartSeconds;
            this.validStartNanos = transactionId.validStartNanos;
        }
    }

    public static newId(accountId: AccountIdLike): TransactionID {
        const acctId = new AccountId(accountId).toProto();

        // allows the transaction to be accepted as long as the node isn't 10 seconds behind us
        const { seconds, nanos } = dateToTimestamp(Date.now() - 10_000);

        const validStart = new Timestamp();
        validStart.setSeconds(seconds);
        validStart.setNanos(nanos);

        const txnId = new TransactionID();
        txnId.setAccountid(acctId);
        txnId.setTransactionvalidstart(validStart);

        return txnId;
    }

    public toString(): string {
        return `${this.account.toString()}@${this.validStartSeconds}.${this.validStartNanos}`;
    }

    public static fromString(id: string): TransactionId {
        const [ account, time ] = id.split("@");
        const [ seconds, nanos ] = time.split(".");

        return new TransactionId({
            account: new AccountId(account),
            validStartSeconds: Number(seconds),
            validStartNanos: Number(nanos)
        });
    }

    public static fromProto(id: TransactionID): TransactionId {
        return new TransactionId({
            account: AccountId.fromProto(orThrow(id.getAccountid())),
            validStartSeconds: orThrow(id.getTransactionvalidstart()).getSeconds(),
            validStartNanos: orThrow(id.getTransactionvalidstart()).getNanos()
        });
    }

    public toProto(): TransactionID {
        const txnId = new TransactionID();
        txnId.setAccountid(this.account.toProto());

        const ts = new Timestamp();
        ts.setSeconds(this.validStartSeconds);
        ts.setNanos(this.validStartNanos);
        txnId.setTransactionvalidstart(ts);

        return txnId;
    }
}

/**
 * Input type for an ID of a new transaction.
 */
export type TransactionIdLike = { account: AccountIdLike }
& ({ validStart: Date } | { validStartSeconds: number; validStartNanos: number });
