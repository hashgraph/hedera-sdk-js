import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {BaseClient} from "../BaseClient";
import {SmartContractService} from "../generated/SmartContractService_pb_service";

import {ContractDeleteTransactionBody} from "../generated/ContractDelete_pb";
import {ContractID} from "../generated/BasicTypes_pb";
import {ContractId} from "../typedefs";

export class ContractDeleteTransaction extends TransactionBuilder {
    private readonly body: ContractDeleteTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this.body = new ContractDeleteTransactionBody();
        this.inner.setContractdeleteinstance(this.body);
    }

    protected doValidate(errors: string[]): void {
        if (!this.body.hasContractid()) {
            errors.push('ContractDeleteTransaction requires contract id to be set');
            return;
        }
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
        return SmartContractService.deleteContract;
    }
}
