import { TransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";

import { FileService } from "../generated/FileService_pb_service";
import { FileAppendTransactionBody } from "../generated/FileAppend_pb";
import { FileIdLike, fileIdToProto } from "../file/FileId";

export class FileAppendTransaction extends TransactionBuilder {
    private readonly _body: FileAppendTransactionBody;

    public constructor() {
        super();
        this._body = new FileAppendTransactionBody();
        this._inner.setFileappend(this._body);
    }

    protected _doValidate(errors: string[]): void {
        const file = this._body.getFileid();
        const contents = this._body.getContents();

        if (file == null || contents == null) {
            errors.push("FileAppendTransaction must have a file id and contents set");
        }
    }

    public setFileId(fileId: FileIdLike): this {
        this._body.setFileid(fileIdToProto(fileId));
        return this;
    }

    public setContents(bytes: Uint8Array | string): this {
        this._body.setContents(bytes);
        return this;
    }

    public get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.appendContent;
    }
}
