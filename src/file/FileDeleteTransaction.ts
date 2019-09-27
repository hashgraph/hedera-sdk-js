import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {BaseClient} from "../BaseClient";

import {FileService} from "../generated/FileService_pb_service";
import {FileDeleteTransactionBody} from "../generated/FileDelete_pb";
import {FileIdLike} from "../typedefs";
import {getProtoFileId} from "../util";

export class FileDeleteTransaction extends TransactionBuilder {
    private readonly _body: FileDeleteTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this._body = new FileDeleteTransactionBody();
        this._inner.setFiledelete(this._body);
    }

    protected _doValidate(errors: string[]): void {
        const fileId = this._body.getFileid();

        if (fileId == null) {
            errors.push('FileDeleteTransaction must have a file set');
            return;
        }
    }

    public setFileId(fileIdLike: FileIdLike): this {
        this._body.setFileid(getProtoFileId(fileIdLike));
        return this;
    }

    public get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.deleteFile;
    }
}
