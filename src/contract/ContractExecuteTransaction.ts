import { TransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { SmartContractService } from "../generated/SmartContractService_pb_service";
import { ContractCallTransactionBody } from "../generated/ContractCall_pb";
import { ContractId, ContractIdLike } from "./ContractId";
import { ContractFunctionParams } from "./ContractFunctionParams";
import { Hbar, Tinybar } from "../Hbar";

export class ContractExecuteTransaction extends TransactionBuilder {
    private readonly _body: ContractCallTransactionBody;

    public constructor() {
        super();
        this._body = new ContractCallTransactionBody();
        this._inner.setContractcall(this._body);
    }

    public setGas(gas: Tinybar | Hbar): this {
        const hbar = typeof gas === "number" ? Hbar.fromTinybar(gas) : gas as Hbar;
        hbar._check();

        this._body.setGas(hbar._toProto());
        return this;
    }

    public setPayableAmount(amount: Tinybar | Hbar): this {
        const hbar = typeof amount === "number" ? Hbar.fromTinybar(amount) : amount as Hbar;
        hbar._check();

        this._body.setAmount(hbar._toProto());
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
