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
        this.message = `Received receipt for transaction ${this.transactionId} with exceptional status: ${this.status}`;
    }

    public static _throwIfError(
        code: number,
        receipt: TransactionReceipt,
        transactionId: TransactionId
    ): void {
        const status = Status._fromCode(code);
        if (status._isError()) {
            throw new HederaReceiptStatusError(status, receipt, transactionId);
        }
    }
}
