import { QueryBuilder } from "../QueryBuilder";
import { QueryHeader } from "../generated/query_header_pb";
import { Query } from "../generated/query_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { Response } from "../generated/response_pb";
import { SmartContractService } from "../generated/smart_contract_service_pb_service";
import { ContractGetBytecodeQuery } from "../generated/contract_get_bytecode_pb";
import { ContractId, ContractIdLike } from "./ContractId";
import { ResponseHeader } from "../generated/response_header_pb";

/**
 * Get the bytecode for a smart contract instance.
 */
export class ContractBytecodeQuery extends QueryBuilder<Uint8Array> {
    private readonly _builder: ContractGetBytecodeQuery;
    public constructor() {
        super();

        this._builder = new ContractGetBytecodeQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setContractgetbytecode(this._builder);
    }

    /**
     * The contract for which information is requested.
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
        return SmartContractService.ContractGetBytecode;
    }

    protected _getHeader(): QueryHeader {
        return this._builder.getHeader()!;
    }

    protected _mapResponseHeader(response: Response): ResponseHeader {
        return response.getContractgetbytecoderesponse()!.getHeader()!;
    }

    protected _mapResponse(response: Response): Uint8Array {
        return response.getContractgetbytecoderesponse()!.getBytecode_asU8()!;
    }
}
