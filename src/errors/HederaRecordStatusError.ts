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
    }
}
