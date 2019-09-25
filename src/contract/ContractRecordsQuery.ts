import {QueryBuilder} from "../QueryBuilder";
import {BaseClient} from "../BaseClient";
import {QueryHeader} from "../generated/QueryHeader_pb";
import {Query} from "../generated/Query_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {Response} from "../generated/Response_pb";
import {SmartContractService} from "../generated/SmartContractService_pb_service";
import {recordListToSdk, TransactionRecord} from "../types/TransactionRecord";
import {ContractId, ContractIdLike, contractIdToSdk} from "../types/ContractId";
import {contractIdToProto} from "../util";
import {ContractGetRecordsQuery} from "../generated/ContractGetRecords_pb";

export type ContractRecord = {
    contractId: ContractId;
    recordList: TransactionRecord[];
}

export class ContractRecordsQuery extends QueryBuilder<ContractRecord> {
    private readonly builder: ContractGetRecordsQuery;
    public constructor(client: BaseClient) {
        const header = new QueryHeader();
        super(client, header);
        this.builder = new ContractGetRecordsQuery();
        this.builder.setHeader(header);
        this.inner.setContractgetrecords(this.builder);
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
        return SmartContractService.getTxRecordByContractID;
    }

    protected mapResponse(response: Response): ContractRecord {
        const contractResponse = response.getContractgetrecordsresponse()!;
        const contractId = contractIdToSdk(contractResponse.getContractid()!);
        const recordList = recordListToSdk(contractResponse.getRecordsList()!);

        return {
            contractId,
            recordList
        }
    }
}