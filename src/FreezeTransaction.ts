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

    public setStartTime(hour: number, minute: number): this {
        this._body.setStarthour(hour);
        this._body.setStartmin(minute);

        return this;
    }

    public setEndTime(hour: number, minute: number): this {
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
