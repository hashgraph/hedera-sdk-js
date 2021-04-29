import { Message } from "google-protobuf";

import { QueryBuilder } from "../QueryBuilder";
import { ScheduleService } from "../generated/ScheduleService_pb_service";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/Query_pb";
import { ScheduleGetInfoQuery, ScheduleInfo as ProtoScheduleInfo } from "../generated/ScheduleGetInfo_pb";
import { Transaction } from "../Transaction";
import { Transaction as ProtoTransaction } from "../generated/Transaction_pb";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { SchedulableTransactionBody } from "../generated/SchedulableTransactionBody_pb";
import { Response } from "../generated/Response_pb";
import { ScheduleId, ScheduleIdLike } from "../schedule/ScheduleId";
import { AccountId } from "../account/AccountId";
import { timestampToDate } from "../Timestamp";
import { ResponseHeader } from "../generated/ResponseHeader_pb";
import { BaseClient } from "../BaseClient";
import { Hbar } from "../Hbar";
import { PublicKey, _fromProtoKey, _fromProtoKeyList } from "../crypto/PublicKey";
import { TransactionBody } from "../generated/TransactionBody_pb";
import { TransactionId } from "../TransactionId";
import { newDuration } from "../util";

/**
 * Response when the client sends the node ScheduleGetInfoQuery.
 */
export class ScheduleInfo {
    public scheduleId: ScheduleId;
    public creatorAccountId: AccountId | null;
    public payerAccountId: AccountId | null;
    public transactionBody: SchedulableTransactionBody | null;
    public adminKey: PublicKey | null;
    public signatories: PublicKey[] | null;
    public memo: string | null;
    public expirationTime: Date | null;
    public executionTime: Date | null;
    public deletionTime: Date | null;
    public scheduledTransactionId: TransactionId | null;

    public constructor(scheduleInfo: ProtoScheduleInfo) {
        this.scheduleId = ScheduleId._fromProto(scheduleInfo.getScheduleid()!);
        this.creatorAccountId = AccountId._fromProto(scheduleInfo.getCreatoraccountid()!);
        this.payerAccountId = AccountId._fromProto(scheduleInfo.getPayeraccountid()!);
        this.transactionBody = scheduleInfo.hasScheduledtransactionbody() ?
            scheduleInfo.getScheduledtransactionbody()! :
            null;
        this.adminKey = _fromProtoKey(scheduleInfo.getAdminkey()!);
        this.signatories = _fromProtoKeyList(scheduleInfo.getSigners()!);
        this.memo = scheduleInfo.getMemo();
        this.expirationTime = scheduleInfo.hasExpirationtime() ?
            timestampToDate(scheduleInfo.getExpirationtime()!) :
            null;
        this.executionTime = scheduleInfo.hasExecutionTime() ?
            timestampToDate(scheduleInfo.getExecutionTime()!) :
            null;
        this.deletionTime = scheduleInfo.hasDeletionTime() ?
            timestampToDate(scheduleInfo.getDeletionTime()!) :
            null;
        this.scheduledTransactionId = scheduleInfo.hasScheduledtransactionid() ?
            TransactionId._fromProto(scheduleInfo.getScheduledtransactionid()!) :
            null;
    }

    public getTransaction(): Transaction {
        const protoTransaction = new ProtoTransaction();
        let scheduledB;
        if(this.transactionBody !== null) {
            scheduledB = this.transactionBody;
        } else {
            throw new Error("scheduled transaction body is empty");
        }
        const body = new TransactionBody();
        body.setMemo(this.transactionBody ? this.transactionBody.getMemo() : "");
        body.setTransactionfee(this.transactionBody ? this.transactionBody.getTransactionfee() : "");
        body.setNodeaccountid(new AccountId(3)._toProto());
        body.setTransactionid(this.scheduledTransactionId?._toProto());
        body.setTransactionvalidduration(newDuration(2));
        switch (scheduledB.getDataCase()) {
            case SchedulableTransactionBody.DataCase.CONTRACTCREATEINSTANCE:
                body.setContractcreateinstance(scheduledB.getContractcreateinstance());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.CONTRACTDELETEINSTANCE:
                body.setContractdeleteinstance(scheduledB.getContractdeleteinstance());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.CONTRACTUPDATEINSTANCE:
                body.setContractupdateinstance(scheduledB.getContractupdateinstance());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.CONTRACTCALL:
                body.setContractcall(scheduledB.getContractcall());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.CONSENSUSCREATETOPIC:
                body.setConsensuscreatetopic(scheduledB.getConsensuscreatetopic());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.CONSENSUSDELETETOPIC:
                body.setConsensusdeletetopic(scheduledB.getConsensusdeletetopic());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.CONSENSUSSUBMITMESSAGE:
                body.setConsensussubmitmessage(scheduledB.getConsensussubmitmessage());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.CONSENSUSUPDATETOPIC:
                body.setConsensusupdatetopic(scheduledB.getConsensusupdatetopic());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.CRYPTOCREATEACCOUNT:
                body.setCryptocreateaccount(scheduledB.getCryptocreateaccount());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.CRYPTODELETE:
                body.setCryptodelete(scheduledB.getCryptodelete());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.CRYPTOUPDATEACCOUNT:
                body.setCryptoupdateaccount(scheduledB.getCryptoupdateaccount());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.CRYPTOTRANSFER:
                body.setCryptotransfer(scheduledB.getCryptotransfer());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.TOKENASSOCIATE:
                body.setTokenassociate(scheduledB.getTokenassociate());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.TOKENBURN:
                body.setTokenburn(scheduledB.getTokenburn());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.TOKENCREATION:
                body.setTokencreation(scheduledB.getTokencreation());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.TOKENDELETION:
                body.setTokendeletion(scheduledB.getTokendeletion());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.TOKENDISSOCIATE:
                body.setTokendissociate(scheduledB.getTokendissociate());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.TOKENFREEZE:
                body.setTokenfreeze(scheduledB.getTokenfreeze());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.TOKENGRANTKYC:
                body.setTokengrantkyc(scheduledB.getTokengrantkyc());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.TOKENMINT:
                body.setTokenmint(scheduledB.getTokenmint());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.TOKENREVOKEKYC:
                body.setTokenrevokekyc(scheduledB.getTokenrevokekyc());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.TOKENUNFREEZE:
                body.setTokenunfreeze(scheduledB.getTokenunfreeze());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.TOKENWIPE:
                body.setTokenwipe(scheduledB.getTokenwipe());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.TOKENUPDATE:
                body.setTokenupdate(scheduledB.getTokenupdate());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            case SchedulableTransactionBody.DataCase.SCHEDULEDELETE:
                body.setScheduledelete(scheduledB.getScheduledelete());
                protoTransaction.setBodybytes(body.serializeBinary());
                return Transaction.fromBytes(protoTransaction.serializeBinary());
            default:
                throw new Error(`unsupported scheduled transaction:${body.getDataCase().toString()}`);
        }
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
