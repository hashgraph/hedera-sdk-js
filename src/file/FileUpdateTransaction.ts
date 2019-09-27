import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {BaseClient} from "../BaseClient";

import {FileService} from "../generated/FileService_pb_service";
import {PublicKey} from "../Keys";
import {KeyList} from "../generated/BasicTypes_pb";
import {FileUpdateTransactionBody} from "../generated/FileUpdate_pb";
import {timestampToProto} from "../util";
import {FileIdLike, fileIdToProto} from "../types/FileId";
import {dateToTimestamp} from "../types/Timestamp";

export class FileUpdateTransaction extends TransactionBuilder {
    private readonly body: FileUpdateTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this.body = new FileUpdateTransactionBody();
        this.inner.setFileupdate(this.body);
    }

    protected doValidate(errors: string[]): void {
        const files = this.body.getKeys();

        if (files == null) {
            errors.push('FileUpdateTransaction must have a file set');
            return;
        }
    }

    public setExpirationTime(date: number | Date): this {
        this.body.setExpirationtime(timestampToProto(dateToTimestamp(date)));
        return this;
    }

    public addKey(key: PublicKey): this {
        const keylist: KeyList = this.body.getKeys() == null ? new KeyList() : this.body.getKeys()!;
        keylist.addKeys(key.toProtoKey());
        this.body.setKeys(keylist);
        return this;
    }

    public setContents(bytes: Uint8Array | string): this {
        this.body.setContents(bytes);
        return this;
    }

    public setFileId(fileIdLike: FileIdLike): this {
        this.body.setFileid(fileIdToProto(fileIdLike));
        return this;
    }

    public get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.updateFile;
    }
}
