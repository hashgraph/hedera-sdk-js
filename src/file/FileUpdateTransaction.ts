import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {BaseClient} from "../BaseClient";

import {FileService} from "../generated/FileService_pb_service";
import {Timestamp} from "../generated/Timestamp_pb";
import {PublicKey} from "../Keys";
import {FileID, KeyList} from "../generated/BasicTypes_pb";
import {FileUpdateTransactionBody} from "../generated/FileUpdate_pb";
import {FileId} from "../typedefs";

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

    public setExpirationTime(date: Date | { seconds: number; nanos: number }): this {
        const timestamp = new Timestamp();

        if (date instanceof Date) {
            timestamp.setSeconds(date.getSeconds());
            timestamp.setNanos(0);
        } else {
            timestamp.setSeconds(date.seconds);
            timestamp.setNanos(date.nanos);
        }

        this.body.setExpirationtime(timestamp);
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

    public setFileId({ shard, realm, file }: FileId): this {
        const fileId = new FileID();
        fileId.setShardnum(shard);
        fileId.setRealmnum(realm);
        fileId.setFilenum(file);
        this.body.setFileid(fileId);
        return this;
    }

    public get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.updateFile;
    }
}
