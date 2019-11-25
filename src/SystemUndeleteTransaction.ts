import { TransactionBuilder } from "./TransactionBuilder";
import { FileIdLike, fileIdToProto, normalizeFileId } from "./file/FileId";
import { ContractIdLike, contractIdToProto } from "./contract/ContractId";
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

    public setId(id: ContractIdLike | FileIdLike): this {
        if (normalizeFileId(id as FileIdLike).file != null) {
            this._body.setFileid(fileIdToProto(id as FileIdLike));
        } else {
            this._body.setContractid(contractIdToProto(id as ContractIdLike));
        }
        return this;
    }

    protected _doValidate(errors: string[]): void {
        if (!this._body.hasContractid() == null && !this._body.hasFileid()) {
            errors.push("SystemDelete must have an id set. Use `.setId()`");
        }
    }

    public get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.systemDelete;
    }
}
