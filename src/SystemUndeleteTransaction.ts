import { TransactionBuilder } from "./TransactionBuilder";
import { FileId, FileIdLike } from "./file/FileId";
import { ContractId, ContractIdLike } from "./contract/ContractId";
import { grpc } from "@improbable-eng/grpc-web";
import { FileService } from "./generated/FileService_pb_service";
import { Transaction } from "./generated/Transaction_pb";
import { TransactionResponse } from "./generated/TransactionResponse_pb";
import { SystemUndeleteTransactionBody } from "./generated/SystemUndelete_pb";
import { normalizeEntityId } from "./util";

export class SystemUndeleteTransaction extends TransactionBuilder {
    private readonly _body: SystemUndeleteTransactionBody;

    public constructor() {
        super();
        this._body = new SystemUndeleteTransactionBody();
        this._inner.setSystemundelete(this._body);
    }

    public setId(id: ContractIdLike | FileIdLike): this {
        try {
            const fileId = normalizeEntityId("file", id as FileIdLike);
            this._body.setFileid(new FileId(fileId).toProto());
        } catch {
            const contractId = normalizeEntityId("contract", id as ContractIdLike);
            this._body.setContractid(new ContractId(contractId).toProto());
        }

        return this;
    }

    protected _doValidate(errors: string[]): void {
        if (!this._body.hasContractid() == null && !this._body.hasFileid()) {
            errors.push("SystemDelete must have an id set. Use `.setId()`");
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.systemDelete;
    }
}
