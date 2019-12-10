import { QueryBuilder } from "../QueryBuilder";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { Query } from "../generated/Query_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { Response } from "../generated/Response_pb";
import { SmartContractService } from "../generated/SmartContractService_pb_service";
import { recordListToSdk, TransactionRecord } from "../TransactionRecord";
import { ContractId, ContractIdLike } from "./ContractId";
import { ContractGetRecordsQuery } from "../generated/ContractGetRecords_pb";
import { ResponseHeader } from "../generated/ResponseHeader_pb";

export interface ContractRecord {
    contractId: ContractId;
    recordList: TransactionRecord[];
}

export class ContractRecordsQuery extends QueryBuilder<ContractRecord> {
    private readonly _builder: ContractGetRecordsQuery;
    public constructor() {
        super();

        this._builder = new ContractGetRecordsQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setContractgetrecords(this._builder);
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
        return SmartContractService.getTxRecordByContractID;
    }

    protected _getHeader(): QueryHeader {
        return this._builder.getHeader()!;
    }

    protected _mapResponseHeader(response: Response): ResponseHeader {
        return response.getContractgetrecordsresponse()!.getHeader()!;
    }

    protected _mapResponse(response: Response): ContractRecord {
        const contractResponse = response.getContractgetrecordsresponse()!;
        const contractId = ContractId._fromProto(contractResponse.getContractid()!);
        const recordList = recordListToSdk(contractResponse.getRecordsList()!);

        return {
            contractId,
            recordList
        };
    }
}
