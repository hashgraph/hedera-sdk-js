import { SingleTransactionBuilder } from "./TransactionBuilder";
import { grpc } from "@improbable-eng/grpc-web";
import { Transaction } from "./generated/Transaction_pb";
import { TransactionResponse } from "./generated/TransactionResponse_pb";
import { FreezeTransactionBody } from "./generated/Freeze_pb";
import { FreezeService } from "./generated/FreezeService_pb_service";

/**
 * Set the freezing period in which the platform will stop creating events and accepting
 * transactions. This is used before safely shut down the platform for maintenance.
 */
export class FreezeTransaction extends SingleTransactionBuilder {
    private readonly _body: FreezeTransactionBody;

    public constructor() {
        super();
        this._body = new FreezeTransactionBody();
        this._inner.setFreeze(this._body);
    }

    /**
     * @param hour  The start hour (in UTC time), a value between 0 and 23.
     * @param minute  The start minute (in UTC time), a value between 0 and 59.
     */
    public setStartTime(date: number | Date): this;
    public setStartTime(hour: number, minute: number): this;
    public setStartTime(dateOrHour: number | Date, maybeMinute?: number): this {
        let hour;
        let minute;
        if (typeof dateOrHour === "number" && maybeMinute != null) {
            hour = dateOrHour as number;
            minute = maybeMinute!;
        } else {
            console.warn("passing `Date` is deprecated; pass the `hour` and `minute` as separate parameters");

            hour = (dateOrHour as Date).getHours();
            minute = (dateOrHour as Date).getMinutes();
        }

        this._body.setStarthour(hour);
        this._body.setStartmin(minute);

        return this;
    }

    /**
     * @param hour  The end hour (in UTC time), a value between 0 and 23.
     * @param minute  The end minute (in UTC time), a value between 0 and 59.
     */
    public setEndTime(date: number | Date): this;
    public setEndTime(hour: number, minute: number): this;
    public setEndTime(dateOrHour: number | Date, maybeMinute?: number): this {
        let hour;
        let minute;
        if (typeof dateOrHour === "number" && maybeMinute != null) {
            hour = dateOrHour as number;
            minute = maybeMinute!;
        } else {
            console.warn("passing `Date` is deprecated; pass the `hour` and `minute` as separate parameters");

            hour = (dateOrHour as Date).getHours();
            minute = (dateOrHour as Date).getMinutes();
        }

        this._body.setEndhour(hour);
        this._body.setEndmin(minute);

        return this;
    }

    protected _doValidate(/* errors: string[] */): void {
        // Do nothing
    }

    protected get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FreezeService.freeze;
    }
}
