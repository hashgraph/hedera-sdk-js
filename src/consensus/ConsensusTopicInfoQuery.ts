import { QueryBuilder } from "../QueryBuilder";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/Query_pb";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { Response } from "../generated/Response_pb";
import { ResponseHeader } from "../generated/ResponseHeader_pb";
import { ConsensusService } from "../generated/ConsensusService_pb_service";
import { ConsensusGetTopicInfoQuery } from "../generated/ConsensusGetTopicInfo_pb";
import { Time } from "../Time";
import { PublicKey, _fromProtoKey } from "../crypto/PublicKey";
import { AccountId } from "../account/AccountId";
import { ConsensusTopicId } from "./ConsensusTopicId";

export interface ConsensusTopicInfo {
    memo: string;
    runningHash: Uint8Array;
    sequenceNumber: number;
    expirationTime: Time | null;
    adminKey: PublicKey | null;
    submitKey: PublicKey | null;
    autoRenewPeriod: number;
    autoRenewAccount: AccountId;
}

export class ConsensusTopicInfoQuery extends QueryBuilder<ConsensusTopicInfo> {
    private readonly _builder: ConsensusGetTopicInfoQuery;

    public constructor() {
        super();

        this._builder = new ConsensusGetTopicInfoQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setConsensusgettopicinfo(this._builder);
    }

    public setTopicId(id: ConsensusTopicId): this {
        this._builder.setTopicid(id._toProto());
        return this;
    }

    protected _doLocalValidate(errors: string[]): void {
        if (!this._builder.hasTopicid()) {
            errors.push(".setTopicId() required");
        }
    }

    protected _getMethod(): grpc.UnaryMethodDefinition<Query, Response> {
        return ConsensusService.getTopicInfo;
    }

    protected _getHeader(): QueryHeader {
        return this._builder.getHeader()!;
    }

    protected _mapResponseHeader(response: Response): ResponseHeader {
        return response.getConsensusgettopicinfo()!.getHeader()!;
    }

    protected _mapResponse(response: Response): ConsensusTopicInfo {
        const topicInfo = response.getConsensusgettopicinfo()!.getTopicinfo()!;

        // return fileConents.getContents_asU8();
        return {
            memo: topicInfo.getMemo(),
            runningHash: topicInfo.getRunninghash_asU8(),
            sequenceNumber: topicInfo.getSequencenumber(),

            expirationTime: topicInfo.hasExpirationtime() ?
                Time._fromProto(topicInfo.getExpirationtime()!) :
                null,

            adminKey: topicInfo.hasAdminkey() ?
                _fromProtoKey(topicInfo.getAdminkey()!) :
                null,

            submitKey: topicInfo.hasSubmitkey() ?
                _fromProtoKey(topicInfo.getSubmitkey()!) :
                null,

            autoRenewPeriod: topicInfo.getAutorenewperiod()!.getSeconds(),
            autoRenewAccount: AccountId._fromProto(topicInfo.getAutorenewaccount()!)
        };
    }
}
