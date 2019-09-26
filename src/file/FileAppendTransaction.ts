import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {BaseClient} from "../BaseClient";

import {FileService} from "../generated/FileService_pb_service";
import {FileAppendTransactionBody} from "../generated/FileAppend_pb";
import {FileIdLike} from "../types/FileId";
import {fileIdToProto} from "../util";

export class FileAppendTransaction extends TransactionBuilder {
    private readonly body: FileAppendTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this.body = new FileAppendTransactionBody();
        this.inner.setFileappend(this.body);
    }

    protected doValidate(errors: string[]): void {
        const file = this.body.getFileid();
        const contents = this.body.getContents();

        if (file == null || contents == null) {
            errors.push('FileAppendTransaction must have a file id and contents set');
            return;
        }
    }

    public setFileId(fileId: FileIdLike): this {
        this.body.setFileid(fileIdToProto(fileId));
        return this;
    }

    public setContents(bytes: Uint8Array | string): this {
        this.body.setContents(bytes);
        return this;
    }

    public get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.appendContent;
    }
}
