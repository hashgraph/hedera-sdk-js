import { QueryBuilder } from "../QueryBuilder";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { Query } from "../generated/Query_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { Response } from "../generated/Response_pb";
import { SmartContractService } from "../generated/SmartContractService_pb_service";
import { ContractId, ContractIdLike } from "./ContractId";
import { ContractFunctionResult } from "./ContractFunctionResult";
import { ContractCallLocalQuery } from "../generated/ContractCallLocal_pb";
import { ContractFunctionParams } from "./ContractFunctionParams";
import { ResponseHeader } from "../generated/ResponseHeader_pb";
import { BaseClient } from "../BaseClient";
import { Hbar } from "../Hbar";

export class ContractCallQuery extends QueryBuilder<ContractFunctionResult> {
    private readonly _builder: ContractCallLocalQuery;

    public constructor() {
        super();

        this._builder = new ContractCallLocalQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setContractcalllocal(this._builder);
    }

    public setContractId(contractIdLike: ContractIdLike): this {
        this._builder.setContractid(new ContractId(contractIdLike)._toProto());
        return this;
    }

    public setFunction(name: string, params: ContractFunctionParams): this {
        this._builder.setFunctionparameters(params._build(name));
        return this;
    }

    public async getCost(client: BaseClient): Promise<Hbar> {
        return (await super.getCost(client)).multipliedBy(1.1);
    }

    protected _doLocalValidate(errors: string[]): void {
        if (!this._builder.hasContractid()) {
            errors.push(".setContractId() required");
        }
    }

    protected _getMethod(): grpc.UnaryMethodDefinition<Query, Response> {
        return SmartContractService.contractCallLocalMethod;
    }

    protected _getHeader(): QueryHeader {
        return this._builder.getHeader()!;
    }

    protected _mapResponseHeader(response: Response): ResponseHeader {
        return response.getContractcalllocal()!.getHeader()!;
    }

    protected _mapResponse(response: Response): ContractFunctionResult {
        return new ContractFunctionResult(response.getContractcalllocal()!.getFunctionresult()!);
    }
}
