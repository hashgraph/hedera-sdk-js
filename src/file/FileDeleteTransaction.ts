import { TransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";

import { FileService } from "../generated/FileService_pb_service";
import { FileDeleteTransactionBody } from "../generated/FileDelete_pb";
import { FileId, FileIdLike } from "../file/FileId";

export class FileDeleteTransaction extends TransactionBuilder {
    private readonly _body: FileDeleteTransactionBody;

    public constructor() {
        super();
        this._body = new FileDeleteTransactionBody();
        this._inner.setFiledelete(this._body);
    }

    public setFileId(fileIdLike: FileIdLike): this {
        this._body.setFileid(new FileId(fileIdLike)._toProto());
        return this;
    }

    protected _doValidate(errors: string[]): void {
        const fileId = this._body.getFileid();

        if (fileId == null) {
            errors.push("FileDeleteTransaction must have a file id set");
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.deleteFile;
    }
}
