import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";

import { FileService } from "../generated/FileService_pb_service";
import { FileAppendTransactionBody } from "../generated/FileAppend_pb";
import { FileId, FileIdLike } from "../file/FileId";
import * as utf8 from "@stablelib/utf8";

/**
 * Append the given contents to the end of the file. If a file is too big to create with a single
 * `FileCreateTransaction``, then it can be created with the first part of its contents, and then
 * appended multiple times to create the entire file.
 */
export class FileAppendTransaction extends SingleTransactionBuilder {
    private readonly _body: FileAppendTransactionBody;

    public constructor() {
        super();
        this._body = new FileAppendTransactionBody();
        this._inner.setFileappend(this._body);
    }

    /**
     * The file ID of the file to which the bytes are appended to.
     */
    public setFileId(fileId: FileIdLike): this {
        this._body.setFileid(new FileId(fileId)._toProto());
        return this;
    }

    /**
     * The bytes to append to the contents of the file.
     */
    public setContents(contents: Uint8Array | string): this {
        const bytes = contents instanceof Uint8Array ?
            contents as Uint8Array :
            utf8.encode(contents as string);

        this._body.setContents(bytes);
        return this;
    }

    protected _doValidate(errors: string[]): void {
        const file = this._body.getFileid();
        const contents = this._body.getContents();

        if (file == null || contents == null) {
            errors.push("FileAppendTransaction must have a file id and contents set");
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.appendContent;
    }
}
