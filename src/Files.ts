import {TransactionBuilder} from "./TransactionBuilder";
import {grpc} from "@improbable-eng/grpc-web";
import {Transaction} from "./generated/Transaction_pb";
import {TransactionResponse} from "./generated/TransactionResponse_pb";
import {FileService} from "./generated/FileService_pb_service";
import {FileCreateTransactionBody} from "./generated/FileCreate_pb";
import {BaseClient} from "./BaseClient";
import {addKey, dateToTimestamp, timestampToMs} from "./util";
import {PublicKey} from "./Keys";
import {FileUpdateTransactionBody} from "./generated/FileUpdate_pb";
import {FileId} from "./typedefs";
import {FileID} from "./generated/BasicTypes_pb";
import {FileAppendTransactionBody} from "./generated/FileAppend_pb";
import {FileDeleteTransactionBody} from "./generated/FileDelete_pb";

export class FileCreateTransaction extends TransactionBuilder {
    private readonly builder: FileCreateTransactionBody;

    public constructor(cient: BaseClient) {
        super(cient);
        this.builder = new FileCreateTransactionBody();
        super.inner.setFilecreate(this.builder);
    }

    public setExpirationTime(expiration: Date, nanoCorrection?: number): this {
        this.builder.setExpirationtime(dateToTimestamp(expiration, nanoCorrection));
        return this;
    }

    public addKey(key: PublicKey): this {
        addKey(this.builder, key);
        return this;
    }

    public setContents(contents: Uint8Array): this {
        this.builder.setContents(contents);
        return this;
    }

    // newRealmAdminKey, shardId and realmId are ignored currently

    protected doValidate(errors: string[]): void {
        const expirationTime = this.builder.getExpirationtime();

        if (!expirationTime) {
            errors.push('file requires an expiration time');
            return;
        }

        if (timestampToMs(expirationTime) > Date.now()) {
            errors.push('file expiration time must be in the future');
        }
    }

    get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.createFile;
    }
}

export class FileUpdateTransaction extends TransactionBuilder {
    private readonly builder: FileUpdateTransactionBody;

    public constructor(cient: BaseClient) {
        super(cient);
        this.builder = new FileUpdateTransactionBody();
        super.inner.setFileupdate(this.builder);
    }

    /** Required: set the ID of the file to update */
    public setFileId({ shard, realm, file }: FileId): this {
        const protoFileId = new FileID();
        protoFileId.setShardnum(shard);
        protoFileId.setRealmnum(realm);
        protoFileId.setFilenum(file);

        this.builder.setFileid(protoFileId);
        return this;
    }

    /**
     * Update the file expiration time; the cost of extending the time will be added to the
     * transaction fee.
     */
    public setExpirationTime(date: Date, nanoCorrection?: number): this {
        this.builder.setExpirationtime(dateToTimestamp(date, nanoCorrection));
        return this;
    }

    /**
     * Replace the contents of the file.
     */
    public setContents(contents: Uint8Array): this {
        this.builder.setContents(contents);
        return this;
    }

    protected doValidate(errors: string[]): void {
        if (!this.builder.hasFileid()) {
            errors.push("`.setFileId()` required");
        }
    }

    get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.updateFile;
    }
}

export class FileAppendTransaction extends TransactionBuilder {

    private readonly builder: FileAppendTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this.builder = new FileAppendTransactionBody();
        super.inner.setFileappend(this.builder);
    }

    /** Required: set the ID of the file to append to */
    public setFileId({ shard, realm, file }: FileId): this {
        const protoFileId = new FileID();
        protoFileId.setShardnum(shard);
        protoFileId.setRealmnum(realm);
        protoFileId.setFilenum(file);

        this.builder.setFileid(protoFileId);
        return this;
    }

    public setContents(contents: Uint8Array): this {
        this.builder.setContents(contents);
        return this;
    }

    protected doValidate(errors: string[]): void {
        if (!this.builder.hasFileid()) {
            errors.push('`.setFileId()` required');
        }

        if (this.builder.getContents_asU8().length === 0) {
            errors.push('`.setContents`: empty or not set');
        }
    }

    get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.appendContent;
    }
}

export class FileDeleteTransaction extends TransactionBuilder {
    private readonly builder: FileDeleteTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this.builder = new FileDeleteTransactionBody();
        super.inner.setFiledelete(this.builder);
    }

    /** Required: set the ID of the file to delete */
    public setFileId({ shard, realm, file }: FileId): this {
        const protoFileId = new FileID();
        protoFileId.setShardnum(shard);
        protoFileId.setRealmnum(realm);
        protoFileId.setFilenum(file);

        this.builder.setFileid(protoFileId);
        return this;
    }

    protected doValidate(errors: string[]): void {
        if (!this.builder.hasFileid()) {
            errors.push('`.setFileId()` required');
        }
    }

    get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.deleteFile;
    }
}
