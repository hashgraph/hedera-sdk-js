import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {BaseClient} from "../BaseClient";

import {FileService} from "../generated/FileService_pb_service";
import {FileDeleteTransactionBody} from "../generated/FileDelete_pb";
import {FileIdLike, fileIdToProto} from "../types/FileId";

export class FileDeleteTransaction extends TransactionBuilder {
    private readonly body: FileDeleteTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this.body = new FileDeleteTransactionBody();
        this.inner.setFiledelete(this.body);
    }

    protected doValidate(errors: string[]): void {
        const fileId = this.body.getFileid();

        if (fileId == null) {
            errors.push('FileDeleteTransaction must have a file set');
            return;
        }
    }

    public setFileId(fileIdLike: FileIdLike): this {
        this.body.setFileid(fileIdToProto(fileIdLike));
        return this;
    }

    public get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.deleteFile;
    }
}
