import { TransactionBuilder } from "./TransactionBuilder";
import { grpc } from "@improbable-eng/grpc-web";
import { Transaction } from "./generated/Transaction_pb";
import { TransactionResponse } from "./generated/TransactionResponse_pb";
import { FreezeTransactionBody } from "./generated/Freeze_pb";
import { FreezeService } from "./generated/FreezeService_pb_service";

export class FreezeTransaction extends TransactionBuilder {
    private readonly _body: FreezeTransactionBody;

    public constructor() {
        super();
        this._body = new FreezeTransactionBody();
        this._inner.setFreeze(this._body);
    }

    public setStartTime(startTime: number | Date): this {
        const startDateTime = new Date(startTime);

        this._body.setStarthour(startDateTime.getUTCHours());
        this._body.setStartmin(startDateTime.getUTCMinutes());

        return this;
    }

    public setEndTime(endTime: number | Date): this {
        const endDateTime = new Date(endTime);

        this._body.setEndhour(endDateTime.getUTCHours());
        this._body.setEndmin(endDateTime.getUTCMinutes());

        return this;
    }

    protected _doValidate(errors: string[]): void {
        // Do nothing
    }

    public get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FreezeService.freeze
    }
}
