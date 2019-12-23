import { QueryBuilder } from "../QueryBuilder";
import { ContractGetInfoQuery } from "../generated/ContractGetInfo_pb";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { Query } from "../generated/Query_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { Response } from "../generated/Response_pb";
import { SmartContractService } from "../generated/SmartContractService_pb_service";
import { ContractId, ContractIdLike } from "./ContractId";
import { AccountId } from "../account/AccountId";
import { timestampToDate } from "../Timestamp";
import { Ed25519PublicKey } from "../crypto/Ed25519PublicKey";
import { ResponseHeader } from "../generated/ResponseHeader_pb";
import { PublicKey, _fromProtoKey } from "../crypto/PublicKey";

export interface ContractInfo {
    contractId: ContractId;
    accountId: AccountId;
    contractAccountId: string;
    adminKey: PublicKey | null;
    expirationTime: Date;
    autoRenewPeriod: number;
    storage: number;
    memo: string;
}

export class ContractInfoQuery extends QueryBuilder<ContractInfo> {
    private readonly _builder: ContractGetInfoQuery;
    public constructor() {
        super();

        this._builder = new ContractGetInfoQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setContractgetinfo(this._builder);
    }

    public setContractId(contractIdLike: ContractIdLike): this {
        this._builder.setContractid(new ContractId(contractIdLike)._toProto());
        return this;
    }

    protected _doLocalValidate(errors: string[]): void {
        if (!this._builder.hasContractid()) {
            errors.push(".setContractId() required");
        }
    }

    protected _getMethod(): grpc.UnaryMethodDefinition<Query, Response> {
        return SmartContractService.getContractInfo;
    }

    protected _getHeader(): QueryHeader {
        return this._builder.getHeader()!;
    }

    protected _mapResponseHeader(response: Response): ResponseHeader {
        return response.getContractgetinfo()!.getHeader()!;
    }

    protected _mapResponse(response: Response): ContractInfo {
        const contractInfo = response.getContractgetinfo()!.getContractinfo()!;

        return {
            contractId: ContractId._fromProto(contractInfo.getContractid()!),
            accountId: AccountId._fromProto(contractInfo.getAccountid()!),
            contractAccountId: contractInfo.getContractaccountid(),
            adminKey: contractInfo.hasAdminkey() ? _fromProtoKey(contractInfo.getAdminkey()!) : null,
            expirationTime: timestampToDate(contractInfo.getExpirationtime()!),
            autoRenewPeriod: contractInfo.getAutorenewperiod()!.getSeconds(),
            storage: contractInfo.getStorage(),
            memo: contractInfo.getMemo()
        };
    }
}
