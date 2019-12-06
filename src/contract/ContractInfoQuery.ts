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

export interface ContractInfo {
    contractId: ContractId;
    accountId: AccountId;
    contractAccountId: string;
    adminKey: Ed25519PublicKey | null;
    expirationTime: Date;
    autoRenewPeriod: number;
    storage: number;
    memo: string;
}

export class ContractInfoQuery extends QueryBuilder<ContractInfo> {
    private readonly _builder: ContractGetInfoQuery;
    public constructor() {
        const header = new QueryHeader();
        super(header);
        this._builder = new ContractGetInfoQuery();
        this._builder.setHeader(header);
        this._inner.setContractgetinfo(this._builder);
    }

    public setContractId(contractIdLike: ContractIdLike): this {
        this._builder.setContractid(new ContractId(contractIdLike)._toProto());
        return this;
    }

    protected _doValidate(errors: string[]): void {
        if (!this._builder.hasContractid()) {
            errors.push(".setContractId() required");
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<Query, Response> {
        return SmartContractService.getContractInfo;
    }

    protected _mapResponse(response: Response): ContractInfo {
        const contractInfo = response.getContractgetinfo()!.getContractinfo()!;

        return {
            contractId: ContractId._fromProto(contractInfo.getContractid()!),
            accountId: AccountId._fromProto(contractInfo.getAccountid()!),
            contractAccountId: contractInfo.getContractaccountid(),
            adminKey: null,
            expirationTime: timestampToDate(contractInfo.getExpirationtime()!),
            autoRenewPeriod: contractInfo.getAutorenewperiod()!.getSeconds(),
            storage: contractInfo.getStorage(),
            memo: contractInfo.getMemo()
        };
    }
}
