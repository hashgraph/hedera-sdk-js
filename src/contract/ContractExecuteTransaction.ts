import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { SmartContractService } from "../generated/SmartContractService_pb_service";
import { ContractCallTransactionBody } from "../generated/ContractCall_pb";
import { ContractId, ContractIdLike } from "./ContractId";
import { ContractFunctionParams } from "./ContractFunctionParams";
import { Hbar, Tinybar, hbarFromTinybarOrHbar, hbarCheck, hbarToProto } from "../Hbar";
import BigNumber from "bignumber.js";

/**
 * Call a function of the given smart contract instance, giving it functionParameters as its inputs.
 * It can use the given amount of gas, and any unspent gas will be refunded to the paying account.
 *
 * If this function stores information, it is charged gas to store it. There is a fee in hbars to
 * maintain that storage until the expiration time, and that fee is added as part of the
 * transaction fee.
 */
export class ContractExecuteTransaction extends SingleTransactionBuilder {
    private readonly _body: ContractCallTransactionBody;

    public constructor() {
        super();
        this._body = new ContractCallTransactionBody();
        this._inner.setContractcall(this._body);
    }

    /**
     * The maximum amount of gas to use for the call.
     */
    public setGas(gas: number | BigNumber): this {
        this._body.setGas(String(gas));
        return this;
    }

    /**
     * Number of tinybars sent (the function must be payable if this is nonzero).
     */
    public setPayableAmount(amount: Tinybar | Hbar): this {
        const amountHbar = hbarFromTinybarOrHbar(amount);
        amountHbar[ hbarCheck ]({ allowNegative: false });

        this._body.setAmount(amountHbar[ hbarToProto ]());
        return this;
    }

    /**
     * Which function to call, and the parameters to pass to the function.
     */
    public setFunction(name: string, params: ContractFunctionParams): this {
        this._body.setFunctionparameters((params ?? new ContractFunctionParams())._build(name));
        return this;
    }

    /**
     * The contract instance to call, in the format used in transactions.
     */
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
