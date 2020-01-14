import { TransactionBuilder } from "./TransactionBuilder";
import { FileId, FileIdLike } from "./file/FileId";
import { ContractId, ContractIdLike } from "./contract/ContractId";
import { grpc } from "@improbable-eng/grpc-web";
import { FileService } from "./generated/FileService_pb_service";
import { Transaction } from "./generated/Transaction_pb";
import { TransactionResponse } from "./generated/TransactionResponse_pb";
import { SystemUndeleteTransactionBody } from "./generated/SystemUndelete_pb";

export class SystemUndeleteTransaction extends TransactionBuilder {
    private readonly _body: SystemUndeleteTransactionBody;

    public constructor() {
        super();
        this._body = new SystemUndeleteTransactionBody();
        this._inner.setSystemundelete(this._body);
    }

    public setFileId(id: FileIdLike): this {
        this._body.setFileid(new FileId(id)._toProto());
        return this;
    }

    public setContractId(id: ContractIdLike): this {
        this._body.setContractid(new ContractId(id)._toProto());
        return this;
    }

    protected _doValidate(errors: string[]): void {
        if (!this._body.hasContractid() == null && !this._body.hasFileid()) {
            errors.push("SystemDelete must have an id set. Use `.setFileId()` or `.setContractId()");
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.systemDelete;
    }
}
