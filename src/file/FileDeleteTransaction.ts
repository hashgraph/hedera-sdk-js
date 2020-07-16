import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";

import { FileService } from "../generated/FileService_pb_service";
import { FileDeleteTransactionBody } from "../generated/FileDelete_pb";
import { FileId, FileIdLike } from "../file/FileId";

/**
 * Delete the given file. After deletion, it will be marked as deleted and will have no contents.
 * But information about it will continue to exist until it expires. A list of keys  was given
 * when the file was created. All the keys on that list must sign transactions to create or modify
 * the file, but any single one of them can be used to delete the file. Each "key" on that list
 * may itself be a threshold key containing other keys (including other threshold keys).
 */
export class FileDeleteTransaction extends SingleTransactionBuilder {
    private readonly _body: FileDeleteTransactionBody;

    public constructor() {
        super();
        this._body = new FileDeleteTransactionBody();
        this._inner.setFiledelete(this._body);
    }

    /**
     * The file to delete. It will be marked as deleted until it expires. Then it will disappear.
     */
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
