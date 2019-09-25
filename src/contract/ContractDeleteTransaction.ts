import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {BaseClient} from "../BaseClient";
import {SmartContractService} from "../generated/SmartContractService_pb_service";

import {ContractDeleteTransactionBody} from "../generated/ContractDelete_pb";
import {ContractIdLike} from "../typedefs";
import {getProtoContractId} from "../util";

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

    public setContractId(contractIdLike: ContractIdLike): this {
        this.body.setContractid(getProtoContractId(contractIdLike));
        return this;
    }

    public get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return SmartContractService.deleteContract;
    }
}
