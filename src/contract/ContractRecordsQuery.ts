import { QueryBuilder } from "../QueryBuilder";
import { QueryHeader } from "../generated/query_header_pb";
import { Query } from "../generated/query_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { Response } from "../generated/response_pb";
import { SmartContractService } from "../generated/smart_contract_service_pb_service";
import { TransactionRecord } from "../TransactionRecord";
import { ContractId, ContractIdLike } from "./ContractId";
import { ContractGetRecordsQuery } from "../generated/contract_get_records_pb";
import { ResponseHeader } from "../generated/response_header_pb";

/**
 * Get all the records for a smart contract instance, for any function call
 * (or the constructor call) during the last 25 hours, for which a Record was requested.
 */
export class ContractRecordsQuery extends QueryBuilder<TransactionRecord[]> {
    private readonly _builder: ContractGetRecordsQuery;
    public constructor() {
        super();

        this._builder = new ContractGetRecordsQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setContractgetrecords(this._builder);
    }

    /**
     * The smart contract instance for which the records should be retrieved.
     */
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

    protected _mapResponse(response: Response): TransactionRecord[] {
        const contractResponse = response.getContractgetrecordsresponse()!;
        return contractResponse
            .getRecordsList()!
            .map(TransactionRecord._fromProto);
    }
}
