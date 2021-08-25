import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/transaction_pb";
import { TransactionResponse } from "../generated/transaction_response_pb";
import { grpc } from "@improbable-eng/grpc-web";

import { ScheduleService } from "../generated/schedule_service_pb_service";
import { ScheduleSignTransactionBody } from "../generated/schedule_sign_pb";
import { ScheduleId, ScheduleIdLike } from "../schedule/ScheduleId";

export class ScheduleSignTransaction extends SingleTransactionBuilder {
    private readonly _body: ScheduleSignTransactionBody;

    public constructor() {
        super();
        this._body = new ScheduleSignTransactionBody();
        this._inner.setSchedulesign(this._body);
    }

    public setScheduleId(scheduleIdLike: ScheduleIdLike): this {
        this._body.setScheduleid(new ScheduleId(scheduleIdLike)._toProto());
        return this;
    }

    protected _doValidate(errors: string[]): void {
        const scheduleId = this._body.getScheduleid();

        if (scheduleId == null) {
            errors.push("ScheduleSignTransaction must have a schedule id set");
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<
        Transaction,
        TransactionResponse
        > {
        return ScheduleService.signSchedule;
    }
}
