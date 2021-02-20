import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";

import { ScheduleService } from "../generated/ScheduleService_pb_service";
import { ScheduleDeleteTransactionBody } from "../generated/ScheduleDelete_pb";
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
