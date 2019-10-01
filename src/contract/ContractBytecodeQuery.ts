import { QueryBuilder } from "../QueryBuilder";
import { BaseClient } from "../BaseClient";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { Query } from "../generated/Query_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { Response } from "../generated/Response_pb";
import { SmartContractService } from "../generated/SmartContractService_pb_service";
import { ContractGetBytecodeQuery } from "../generated/ContractGetBytecode_pb";
import { ContractIdLike, contractIdToProto } from "./ContractId";

export class ContractBytecodeQuery extends QueryBuilder<Uint8Array> {
    private readonly _builder: ContractGetBytecodeQuery;
    public constructor(client: BaseClient) {
        const header = new QueryHeader();
        super(client, header);
        this._builder = new ContractGetBytecodeQuery();
        this._builder.setHeader(header);
        this._inner.setContractgetbytecode(this._builder);
    }

    public setContractId(contractIdLike: ContractIdLike): this {
        this._builder.setContractid(contractIdToProto(contractIdLike));
        return this;
    }

    protected _doValidate(errors: string[]): void {
        if (!this._builder.hasContractid()) {
            errors.push(".setContractId() required");
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<Query, Response> {
        return SmartContractService.contractCallLocalMethod;
    }

    protected _mapResponse(response: Response): Uint8Array {
        return response.getContractgetbytecoderesponse()!.getBytecode_asU8()!;
    }
}
