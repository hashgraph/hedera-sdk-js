import { HederaStatusError } from "./HederaStatusError";
import { Status } from "../Status";
import { TransactionId } from "../TransactionId";
import { TransactionRecord } from "../TransactionRecord";

/**
 * Error returned when the `TransactionRecord` has a bad status code
 */
export class HederaRecordStatusError extends HederaStatusError {
    public readonly transactionId: TransactionId;
    public readonly record: TransactionRecord;

    public constructor(status: Status, record: TransactionRecord, transactionId: TransactionId) {
        super(status);
        this.transactionId = transactionId;
        this.record = record;
        this.name = "HederaRecordStatusError";
        this.message = `Received record for transaction ${this.transactionId} with exceptional status: ${this.status}`;
    }

    public static _throwIfError(
        code: number,
        record: TransactionRecord,
        transactionId: TransactionId
    ): void {
        const status = Status._fromCode(code);
        if (status._isError()) {
            throw new HederaRecordStatusError(status, record, transactionId);
        }
    }
}
