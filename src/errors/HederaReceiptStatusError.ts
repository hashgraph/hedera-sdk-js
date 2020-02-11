import { HederaStatusError } from "./HederaStatusError";
import { Status } from "../Status";
import { TransactionId } from "../TransactionId";
import { TransactionReceipt } from "../TransactionReceipt";

/**
 * Error returned when the `TransactionReceipt` has a bad status code
 */
export class HederaReceiptStatusError extends HederaStatusError {
    public readonly transactionId: TransactionId;
    public readonly receipt: TransactionReceipt;

    public constructor(status: Status, receipt: TransactionReceipt, transactionId: TransactionId) {
        super(status);
        this.transactionId = transactionId;
        this.receipt = receipt;
        this.name = "HederaReceiptStatusError";
    }
}
