import { TransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { SmartContractService } from "../generated/SmartContractService_pb_service";
import { ContractCallTransactionBody } from "../generated/ContractCall_pb";
import BigNumber from "bignumber.js";
import { ContractId, ContractIdLike } from "./ContractId";
import { ContractFunctionParams } from "./ContractFunctionParams";

export class ContractExecuteTransaction extends TransactionBuilder {
    private readonly _body: ContractCallTransactionBody;

    public constructor() {
        super();
        this._body = new ContractCallTransactionBody();
        this._inner.setContractcall(this._body);
    }

    public setGas(gas: number | BigNumber): this {
        this._body.setGas(String(gas));
        return this;
    }

    public setPayableAmount(amount: number): this {
        this._body.setAmount(amount);
        return this;
    }

    public setFunction(name: string, params: ContractFunctionParams): this {
        this._body.setFunctionparameters((params ?? new ContractFunctionParams())._build(name));
        return this;
    }

    public setContractId(contractIdLike: ContractIdLike): this {
        this._body.setContractid(new ContractId(contractIdLike)._toProto());
        return this;
    }

    protected _doValidate(errors: string[]): void {
        if (!this._body.hasContractid()) {
            errors.push(".setContractId() required");
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return SmartContractService.contractCallMethod;
    }
}
