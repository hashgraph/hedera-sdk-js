import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {BaseClient} from "../BaseClient";

import {FileService} from "../generated/FileService_pb_service";
import {FileCreateTransactionBody} from "../generated/FileCreate_pb";
import {Timestamp} from "../generated/Timestamp_pb";
import {PublicKey} from "../Keys";
import {KeyList} from "../generated/BasicTypes_pb";

export class FileCreateTransaction extends TransactionBuilder {
    private readonly body: FileCreateTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this.body = new FileCreateTransactionBody();
        this.inner.setFilecreate(this.body);
    }

    protected doValidate(errors: string[]): void {
        const files = this.body.getKeys();

        if (files == null) {
            errors.push('FileCreateTransaction must have a file set');
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

    public get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.createFile;
    }
}
