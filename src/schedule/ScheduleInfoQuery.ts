import { Message } from "google-protobuf";

import { QueryBuilder } from "../QueryBuilder";
import { ScheduleService } from "../generated/ScheduleService_pb_service";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/Query_pb";
import { ScheduleGetInfoQuery, ScheduleInfo as ProtoScheduleInfo } from "../generated/ScheduleGetInfo_pb";
import { Transaction } from "../Transaction";
import { Transaction as ProtoTransaction } from "../generated/Transaction_pb";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { Response } from "../generated/Response_pb";
import { ScheduleId, ScheduleIdLike } from "../schedule/ScheduleId";
import { AccountId } from "../account/AccountId";
import { timestampToDate } from "../Timestamp";
import { ResponseHeader } from "../generated/ResponseHeader_pb";
import { BaseClient } from "../BaseClient";
import { Hbar } from "../Hbar";
import { PublicKey, _fromProtoKey, _fromProtoKeyList } from "../crypto/PublicKey";

/**
 * Response when the client sends the node ScheduleGetInfoQuery.
 */
export class ScheduleInfo {
    public scheduleId: ScheduleId;
    public creatorAccountId: AccountId | null;
    public payerAccountId: AccountId | null;
    public transactionBody: Uint8Array | null;
    public adminKey: PublicKey | null;
    public signatories: PublicKey[] | null;
    public memo: string | null;
    public expirationTime: Date | null;

    public constructor(scheduleInfo: ProtoScheduleInfo) {
        this.scheduleId = ScheduleId._fromProto(scheduleInfo.getScheduleid()!);
        this.creatorAccountId = AccountId._fromProto(scheduleInfo.getCreatoraccountid()!);
        this.payerAccountId = AccountId._fromProto(scheduleInfo.getPayeraccountid()!);
        this.transactionBody = scheduleInfo.getTransactionbody_asU8();
        this.adminKey = _fromProtoKey(scheduleInfo.getAdminkey()!);
        this.signatories = _fromProtoKeyList(scheduleInfo.getSignatories()!);
        this.memo = scheduleInfo.getMemo();
        this.expirationTime = scheduleInfo.hasExpirationtime() ?
            timestampToDate(scheduleInfo.getExpirationtime()!) :
            null;
    }

    public getTransaction(): Transaction {
        const protoTransaction = new ProtoTransaction();
        protoTransaction.setBodybytes(this.transactionBody != null ?
            this.transactionBody :
            new Uint8Array());
        const bytes = protoTransaction.serializeBinary();

        return Transaction.fromBytes(bytes);
    }
}

export class ScheduleInfoQuery extends QueryBuilder<ScheduleInfo> {
    private readonly _builder: ScheduleGetInfoQuery;

    public constructor() {
        super();

        this._builder = new ScheduleGetInfoQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setSchedulegetinfo(this._builder);
    }

    /**
     * The schedule ID of the schedule for which information is requested.
     */
    public setScheduleId(scheduleId: ScheduleIdLike): this {
        this._builder.setScheduleid(new ScheduleId(scheduleId)._toProto());
        return this;
    }

    public async getCost(client: BaseClient): Promise<Hbar> {
        // deleted schedules return a COST_ANSWER of zero which triggers `INSUFFICIENT_TX_FEE`
        // if you set that as the query payment; 25 tinybar seems to be the minimum to get
        // `SCHEDULE_DELETED` back instead.
        const min = Hbar.fromTinybar(25);
        const cost = await super.getCost(client);
        return cost.isGreaterThan(min) ? cost : min;
    }

    protected _doLocalValidate(errors: string[]): void {
        if (!this._builder.hasScheduleid()) {
            errors.push(".setScheduleId() required");
        }
    }

    protected _getMethod(): grpc.UnaryMethodDefinition<Query, Response> {
        return ScheduleService.getScheduleInfo;
    }

    protected _getHeader(): QueryHeader {
        return this._builder.getHeader()!;
    }

    protected _mapResponseHeader(response: Response): ResponseHeader {
        return response.getSchedulegetinfo()!.getHeader()!;
    }

    protected _mapResponse(response: Response): ScheduleInfo {
        const scheduleInfo = response.getSchedulegetinfo()!.getScheduleinfo()!;

        return new ScheduleInfo(scheduleInfo);
    }
}
