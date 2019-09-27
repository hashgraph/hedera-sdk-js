import {QueryBuilder} from "../QueryBuilder";
import {BaseClient} from "../BaseClient";
import {ContractGetInfoQuery} from "../generated/ContractGetInfo_pb";
import {QueryHeader} from "../generated/QueryHeader_pb";
import {Query} from "../generated/Query_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {Response} from "../generated/Response_pb";
import {SmartContractService} from "../generated/SmartContractService_pb_service";
import {Ed25519PublicKey} from "../Keys";
import {ContractId, ContractIdLike, contractIdToProto, contractIdToSdk} from "../types/ContractId";
import {AccountId, accountIdToSdk} from "../types/AccountId";
import {timestampToDate} from "../types/Timestamp";

export type ContractInfo = {
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
    private readonly builder: ContractGetInfoQuery;
    public constructor(client: BaseClient) {
        const header = new QueryHeader();
        super(client, header);
        this.builder = new ContractGetInfoQuery();
        this.builder.setHeader(header);
        this.inner.setContractgetinfo(this.builder);
    }

    public setContractId(contractIdLike: ContractIdLike): this {
        this.builder.setContractid(contractIdToProto(contractIdLike));
        return this;
    }

    protected doValidate(errors: string[]): void {
        if (!this.builder.hasContractid()) {
            errors.push(".setContractId() required");
        }
    }

    protected getMethod(): grpc.UnaryMethodDefinition<Query, Response> {
        return SmartContractService.getContractInfo;
    }

    protected mapResponse(response: Response): ContractInfo {
        const contractInfo = response.getContractgetinfo()!.getContractinfo()!;

        return {
            contractId: contractIdToSdk(contractInfo.getContractid()!),
            accountId: accountIdToSdk(contractInfo.getAccountid()!),
            contractAccountId: contractInfo.getContractaccountid(),
            adminKey: null,
            expirationTime: timestampToDate(contractInfo.getExpirationtime()!),
            autoRenewPeriod: contractInfo.getAutorenewperiod()!.getSeconds(),
            storage: contractInfo.getStorage(),
            memo: contractInfo.getMemo()
        }
    }
}