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
    private readonly _body: ContractDeleteTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this._body = new ContractDeleteTransactionBody();
        this._inner.setContractdeleteinstance(this._body);
    }

    protected _doValidate(errors: string[]): void {
        if (!this._body.hasContractid()) {
            errors.push('ContractDeleteTransaction requires contract id to be set');
            return;
        }
    }

    public setContractId(contractIdLike: ContractIdLike): this {
        this._body.setContractid(getProtoContractId(contractIdLike));
        return this;
    }

    public get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return SmartContractService.deleteContract;
    }
}
