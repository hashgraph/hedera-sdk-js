import { QueryBuilder } from "../QueryBuilder";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { Query } from "../generated/Query_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { Response } from "../generated/Response_pb";
import { SmartContractService } from "../generated/SmartContractService_pb_service";
import { ContractGetBytecodeQuery } from "../generated/ContractGetBytecode_pb";
import { ContractId, ContractIdLike } from "./ContractId";
import { ResponseHeader } from "../generated/ResponseHeader_pb";

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
