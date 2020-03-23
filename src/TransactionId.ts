import {
    AccountId,
    AccountIdLike
} from "./account/AccountId";
import { TransactionID } from "./generated/BasicTypes_pb";
import { orThrow } from "./util";
import { Timestamp } from "./generated/Timestamp_pb";
import { dateToTimestamp, Timestamp as JsTimestamp } from "./Timestamp";
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
 *
 * The ID for a transaction. This is used for retrieving receipts and records for a transaction,
 * for appending to a file right after creating it, for instantiating a smart contract with
 * bytecode in a file just created, and internally by the network for detecting when duplicate
 * transactions are submitted. A user might get a transaction processed faster by submitting it
 * to N nodes, each with a different node account, but all with the same TransactionID. Then,
 * the transaction will take effect when the first of all those nodes submits the transaction
 * and it reaches consensus. The other transactions will not take effect. So this could make the
 * transaction take effect faster, if any given node might be slow. However, the full transaction
 * fee is charged for each transaction, so the total fee is N times as much if the transaction
 * is sent to N nodes.
 */
export class TransactionId {
    /**
     * The Account ID that paid for this transaction.
     */
    public readonly accountId: AccountId;

    /**
     * The transaction is invalid if consensusTimestamp < transactionID.transactionStartValid.
     */
    public readonly validStart: Time

    public constructor(id: TransactionIdLike | AccountIdLike) {
        // Cannot use try/catch here because test die horribly
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        // eslint-disable-next-line dot-notation
        if (!(id as TransactionIdLike)[ "validStart" ] && !(id as TransactionIdLike)[ "validStartSeconds" ]) {
            this.accountId = new AccountId(id as AccountIdLike);

            const { seconds, nanos } = getIncreasingInstant();

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
        HederaReceiptStatusError._throwIfError(receipt.status.code, receipt, this);

        return receipt;
    }

    public async getRecord(client: BaseClient): Promise<TransactionRecord> {
        // Wait for consensus using a free query first

        try {
            await this.getReceipt(client);
        } catch (error) {
            if (!(error instanceof HederaReceiptStatusError)) {
                throw error;
            }
        }

        const record = await new TransactionRecordQuery()
            .setTransactionId(this)
            .execute(client);

        HederaRecordStatusError._throwIfError(record.receipt!.status.code, record, this);

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

let lastInstant: JsTimestamp;

// We need this method to return a timestamp because JS times do not generally
// handle nanoseconds. So if transactions are created too quickly, duplicate timestamps
// could be produced. This method ensures the timestamps are always _increasing_ or monotonic.
function getIncreasingInstant(): JsTimestamp {
    // Allows the transaction to be accepted as long as the
    // server is not more than 10 seconds behind us
    const instant = dateToTimestamp(Date.now() - 10_000);

    // ensures every instant is at least always greater than the last
    lastInstant = lastInstant != null && instantLessThanOrEqual(instant, lastInstant) ?
        addNanos(lastInstant, 1) :
        instant;

    return instant;
}

function addNanos(a: JsTimestamp, n: number): JsTimestamp {
    return {
        seconds: a.seconds,
        nanos: a.nanos + n
    };
}

function instantLessThanOrEqual(a: JsTimestamp, b: JsTimestamp): boolean {
    if (a.seconds < b.seconds) return true;
    if (a.seconds > b.seconds) return false;
    if (a.nanos < b.nanos) return true;
    if (a.nanos > b.nanos) return false;

    return true;
}

/**
 * Input type for an ID of a new transaction.
 */
export type TransactionIdLike =
    ({ account: AccountIdLike } &
        ({ validStart: Date } | { validStartSeconds: number; validStartNanos: number })) |
    TransactionId;
