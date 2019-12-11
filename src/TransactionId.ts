import {
    AccountId,
    AccountIdLike
} from "./account/AccountId";
import { TransactionID } from "./generated/BasicTypes_pb";
import { orThrow } from "./util";
import { Timestamp } from "./generated/Timestamp_pb";
import { dateToTimestamp } from "./Timestamp";
import { BaseClient } from "./BaseClient";
import { TransactionReceipt } from "./TransactionReceipt";
import { TransactionRecord } from "./TransactionRecord";
import { TransactionReceiptQuery } from "./TransactionReceiptQuery";
import { TransactionRecordQuery } from "./TransactionRecordQuery";

/**
 * Normalized transaction ID returned by various methods in the SDK.
 */

export class TransactionId {
    public readonly accountId: AccountId;
    
    public readonly validStartSeconds: number;

    public readonly validStartNanos: number;

    public constructor(id: TransactionIdLike | AccountIdLike) {
        // Cannot use try/catch here because test die horribly
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        // eslint-disable-next-line dot-notation
        if (!(id as TransactionIdLike)[ "validStart" ] && !(id as TransactionIdLike)[ "validStartSeconds" ]) {
            this.accountId = new AccountId(id as AccountIdLike);

            // allows the transaction to be accepted as long as the node isn't 10 seconds behind us
            const { seconds, nanos } = dateToTimestamp(Date.now() - 10_000);

            this.validStartSeconds = seconds;
            this.validStartNanos = nanos;
        } else {
            const transactionId = id as TransactionIdLike;

            if (transactionId instanceof TransactionId) {
                this.accountId = transactionId.accountId;
                this.validStartSeconds = transactionId.validStartSeconds;
                this.validStartNanos = transactionId.validStartNanos;
            } else {
                this.accountId = new AccountId(transactionId.account);

                if ("validStart" in transactionId) {
                    const { seconds, nanos } = dateToTimestamp(transactionId.validStart);

                    this.validStartSeconds = seconds;
                    this.validStartNanos = nanos;
                } else {
                    this.validStartSeconds = transactionId.validStartSeconds;
                    this.validStartNanos = transactionId.validStartNanos;
                }
            }
        }
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

    public toString(): string {
        return `${this.accountId.toString()}@${this.validStartSeconds}.${this.validStartNanos}`;
    }

    public getReceipt(client: BaseClient): Promise<TransactionReceipt> {
        return new TransactionReceiptQuery()
            .setTransactionId(this)
            .execute(client);
    }

    public async getRecord(client: BaseClient): Promise<TransactionRecord> {
        // Wait for consensus using a free query first
        await this.getReceipt(client);
        return new TransactionRecordQuery()
            .setTransactionId(this)
            .execute(client);
    }

    // NOT A STABLE API
    public static _fromProto(id: TransactionID): TransactionId {
        return new TransactionId({
            account: AccountId._fromProto(orThrow(id.getAccountid())),
            validStartSeconds: orThrow(id.getTransactionvalidstart()).getSeconds(),
            validStartNanos: orThrow(id.getTransactionvalidstart()).getNanos()
        });
    }

    // NOT A STABLE API
    public _toProto(): TransactionID {
        const txnId = new TransactionID();
        txnId.setAccountid(this.accountId._toProto());

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
export type TransactionIdLike =
    ({ account: AccountIdLike } &
        ({ validStart: Date } | { validStartSeconds: number; validStartNanos: number })) |
    TransactionId;
