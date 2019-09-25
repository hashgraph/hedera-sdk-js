import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {BaseClient} from "../BaseClient";
import {SmartContractService} from "../generated/SmartContractService_pb_service";

import {ContractCallTransactionBody} from "../generated/ContractCall_pb";
import BigNumber from "bignumber.js";
import {contractIdToProto} from "../util";
import {ContractIdLike} from "../types/ContractId";

export class ContractExecuteTransaction extends TransactionBuilder {
    private readonly body: ContractCallTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this.body = new ContractCallTransactionBody();
        this.inner.setContractcall(this.body);
    }


    protected doValidate(errors: string[]): void {
        if (!this.body.hasContractid()) {
            errors.push(".setContractId() required");
        }
    }

    public setGas(gas: number | BigNumber): this {
        this.body.setGas(String(gas));
        return this;
    }

    public setAmount(amount: number): this {
        this.body.setAmount(amount);
        return this;
    }

    public setFunctionParameters(params: string): this {
        this.body.setFunctionparameters(params);
        return this;
    }

    public setContractId(contractIdLike: ContractIdLike): this {
        this.body.setContractid(contractIdToProto(contractIdLike));
        return this;
    }

    public get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return SmartContractService.contractCallMethod;
    }
}
