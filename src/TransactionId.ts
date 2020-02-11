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
import { Time } from "./Time";
import { HederaReceiptStatusError } from "./errors/HederaReceiptStatusError";
import { HederaRecordStatusError } from "./errors/HederaRecordStatusError";

/**
 * Normalized transaction ID returned by various methods in the SDK.
 */

export class TransactionId {
    public readonly accountId: AccountId;

    public readonly validStart: Time

    public constructor(id: TransactionIdLike | AccountIdLike) {
        // Cannot use try/catch here because test die horribly
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        // eslint-disable-next-line dot-notation
        if (!(id as TransactionIdLike)[ "validStart" ] && !(id as TransactionIdLike)[ "validStartSeconds" ]) {
            this.accountId = new AccountId(id as AccountIdLike);

            // allows the transaction to be accepted as long as the node isn't 10 seconds behind us
            const { seconds, nanos } = dateToTimestamp(Date.now() - 10_000);

            this.validStart = new Time(seconds, nanos);
        } else {
            const transactionId = id as TransactionIdLike;

            if (transactionId instanceof TransactionId) {
                this.accountId = transactionId.accountId;
                this.validStart = new Time(
                    transactionId.validStart.seconds,
                    transactionId.validStart.nanos
                );
            } else {
                this.accountId = new AccountId(transactionId.account);

                if ("validStart" in transactionId) {
                    const { seconds, nanos } = dateToTimestamp(transactionId.validStart);

                    this.validStart = new Time(seconds, nanos);
                } else {
                    this.validStart = new Time(
                        transactionId.validStartSeconds,
                        transactionId.validStartNanos
                    );
                }
            }
        }
    }

    public static withValidStart(id: AccountIdLike, validStart: Time): TransactionId {
        return new TransactionId({
            account: id,
            validStartSeconds: validStart.seconds,
            validStartNanos: validStart.nanos
        });
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
        return `${this.accountId.toString()}@${this.validStart.seconds}.${this.validStart.nanos}`;
    }

    public async getReceipt(client: BaseClient): Promise<TransactionReceipt> {
        const receipt = await new TransactionReceiptQuery()
            .setTransactionId(this)
            .execute(client);

        // Throw an exception on an invalid receipt status
        try {
            receipt.status._throwIfError();
        } catch (error) {
            throw new HederaReceiptStatusError(receipt.status, receipt, this);
        }

        return receipt;
    }

    public async getRecord(client: BaseClient): Promise<TransactionRecord> {
        // Wait for consensus using a free query first

        try {
            await this.getReceipt(client);
        } catch (error) {
            // Do nothing, we want record either way
        }

        const record = await new TransactionRecordQuery()
            .setTransactionId(this)
            .execute(client);

        try {
            record.receipt!.status._throwIfError();
        } catch (error) {
            throw new HederaRecordStatusError(record.receipt!.status, record, this);
        }

        return record;
    }

    // NOT A STABLE API
    public static _fromProto(id: TransactionID): TransactionId {
        const seconds = orThrow(id.getTransactionvalidstart()).getSeconds();
        const nanos = orThrow(id.getTransactionvalidstart()).getNanos();

        return new TransactionId({
            account: AccountId._fromProto(orThrow(id.getAccountid())),
            validStartSeconds: seconds,
            validStartNanos: nanos
        });
    }

    // NOT A STABLE API
    public _toProto(): TransactionID {
        const txnId = new TransactionID();
        txnId.setAccountid(this.accountId._toProto());

        const ts = new Timestamp();
        ts.setSeconds(this.validStart.seconds);
        ts.setNanos(this.validStart.nanos);
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
