import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction as ProtoTransaction } from "../generated/transaction_pb";
import { SCHEDULE_CREATE_TRANSACTION, Transaction } from "../Transaction";
import { TransactionResponse } from "../generated/transaction_response_pb";
import { grpc } from "@improbable-eng/grpc-web";

import { ScheduleService } from "../generated/schedule_service_pb_service";
import { ScheduleCreateTransactionBody } from "../generated/schedule_create_pb";
import { KeyList } from "../generated/basic_types_pb";
import { dateToTimestamp, timestampToProto } from "../Timestamp";
import { PublicKey } from "../crypto/PublicKey";
import { AccountId } from "../account/AccountId";
import * as utf8 from "@stablelib/utf8";

export class ScheduleCreateTransaction extends SingleTransactionBuilder {
    // FOR INERTNAL USE ONLY
    public readonly _body: ScheduleCreateTransactionBody;

    public constructor() {
        super();
        this._body = new ScheduleCreateTransactionBody();
        this._inner.setSchedulecreate(this._body);
    }

    public setAdminKey(publicKey: PublicKey): this {
        this._body.setAdminkey(publicKey._toProtoKey());
        return this;
    }

    public setPayerAccountId(payerAccountId: AccountId): this {
        this._body.setPayeraccountid(payerAccountId._toProto());
        return this;
    }

    public setScheduledTransaction(transaction: Transaction): this {
        const scheduled = transaction.schedule();

        this._body.setScheduledtransactionbody(scheduled._body.getScheduledtransactionbody()!);

        return this;
    }

    protected _doValidate(): void {
        // No local validation
    }

    protected get _method(): grpc.UnaryMethodDefinition<
        ProtoTransaction,
        TransactionResponse
        > {
        return ScheduleService.createSchedule;
    }
}

SCHEDULE_CREATE_TRANSACTION.push(() => new ScheduleCreateTransaction());
