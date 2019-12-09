import { TransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { SmartContractService } from "../generated/SmartContractService_pb_service";

import { ContractDeleteTransactionBody } from "../generated/ContractDelete_pb";
import { ContractId, ContractIdLike } from "./ContractId";

export class ContractDeleteTransaction extends TransactionBuilder {
    private readonly _body: ContractDeleteTransactionBody;

    public constructor() {
        super();
        this._body = new ContractDeleteTransactionBody();
        this._inner.setContractdeleteinstance(this._body);
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
        return SmartContractService.deleteContract;
    }
}
