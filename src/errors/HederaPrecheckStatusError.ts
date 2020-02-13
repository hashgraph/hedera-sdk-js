import { HederaStatusError } from "./HederaStatusError";
import { Status } from "../Status";
import { TransactionId } from "../TransactionId";

/**
 * Error returned when precheck fails with a bad status code
 */
export class HederaPrecheckStatusError extends HederaStatusError {
    public readonly transactionId: TransactionId;

    public constructor(status: Status, transactionId: TransactionId) {
        super(status);
        this.transactionId = transactionId;
        this.name = "HederaPrecheckStatusError";
        this.message = `Transaction ${this.transactionId} failed with status: ${this.status}`;
    }

    public static _throwIfError(code: number, transactionId: TransactionId): void {
        const status = Status._fromCode(code);
        if (status._isError()) {
            throw new HederaPrecheckStatusError(status, transactionId);
        }
    }
}
