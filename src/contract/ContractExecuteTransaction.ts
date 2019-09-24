import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {BaseClient} from "../BaseClient";
import {SmartContractService} from "../generated/SmartContractService_pb_service";

import {ContractID} from "../generated/BasicTypes_pb";
import {ContractId} from "../typedefs";
import {ContractCallTransactionBody} from "../generated/ContractCall_pb";
import BigNumber from "bignumber.js";

export class ContractExecuteTransaction extends TransactionBuilder {
    private readonly body: ContractCallTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this.body = new ContractCallTransactionBody();
        this.inner.setContractcall(this.body);
    }

    protected doValidate(errors: string[]): void {
        if (!this.body.hasContractid()) {
            errors.push('ContractExecuteTransaction requires contract id to be set');
            return;
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

    public setContractId({ shard, realm, contract }: ContractId): this {
        const contractId = new ContractID();
        contractId.setShardnum(shard);
        contractId.setRealmnum(realm);
        contractId.setContractnum(contract);
        this.body.setContractid(contractId);
        return this;
    }

    public get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return SmartContractService.contractCallMethod;
    }
}
