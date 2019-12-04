import { QueryBuilder } from "../QueryBuilder";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { Query } from "../generated/Query_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { Response } from "../generated/Response_pb";
import { SmartContractService } from "../generated/SmartContractService_pb_service";
import { ContractId, ContractIdLike } from "./ContractId";
import { ContractFunctionResult, contractFunctionResultToSdk } from "./ContractFunctionResult";
import { ContractCallLocalQuery } from "../generated/ContractCallLocal_pb";
import { CallParams } from "./CallParams";

export class ContractCallQuery extends QueryBuilder<ContractFunctionResult> {
    private readonly _builder: ContractCallLocalQuery;
    public constructor() {
        const header = new QueryHeader();
        super(header);
        this._builder = new ContractCallLocalQuery();
        this._builder.setHeader(header);
        this._inner.setContractcalllocal(this._builder);
    }

    public setContractId(contractIdLike: ContractIdLike): this {
        this._builder.setContractid(new ContractId(contractIdLike).toProto());
        return this;
    }

    public setFunctionParameters(params: CallParams | Uint8Array): this {
        if (params instanceof Uint8Array) {
            this._builder.setFunctionparameters(params as Uint8Array);
        } else {
            this._builder.setFunctionparameters((params as CallParams)._toProto());
        }
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

    protected _mapResponse(response: Response): ContractFunctionResult {
        return contractFunctionResultToSdk(response.getContractcalllocal()!.getFunctionresult()!);
    }
}
