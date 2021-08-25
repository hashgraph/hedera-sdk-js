import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/transaction_pb";
import { TransactionResponse } from "../generated/transaction_response_pb";
import { grpc } from "@improbable-eng/grpc-web";

import { ScheduleService } from "../generated/schedule_service_pb_service";
import { ScheduleDeleteTransactionBody } from "../generated/schedule_delete_pb";
import { ScheduleId, ScheduleIdLike } from "../schedule/ScheduleId";

export class ScheduleDeleteTransaction extends SingleTransactionBuilder {
    private readonly _body: ScheduleDeleteTransactionBody;

    public constructor() {
        super();
        this._body = new ScheduleDeleteTransactionBody();
        this._inner.setScheduledelete(this._body);
    }

    public setScheduleId(scheduleIdLike: ScheduleIdLike): this {
        this._body.setScheduleid(new ScheduleId(scheduleIdLike)._toProto());
        return this;
    }

    protected _doValidate(errors: string[]): void {
        const scheduleId = this._body.getScheduleid();

        if (scheduleId == null) {
            errors.push("ScheduleDeleteTransaction must have a schedule id set");
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<
        Transaction,
        TransactionResponse
        > {
        return ScheduleService.deleteSchedule;
    }
}
