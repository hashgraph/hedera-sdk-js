import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {BaseClient} from "../BaseClient";

import {FileService} from "../generated/FileService_pb_service";
import {FileCreateTransactionBody} from "../generated/FileCreate_pb";
import {Ed25519PublicKey} from "../Keys";
import {KeyList} from "../generated/BasicTypes_pb";
import {dateToTimestamp, getProtoTimestamp} from "../util";

export class FileCreateTransaction extends TransactionBuilder {
    private readonly _body: FileCreateTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this._body = new FileCreateTransactionBody();
        this._inner.setFilecreate(this._body);
    }

    public setExpirationTime(date: number | Date): this {
        this._body.setExpirationtime(getProtoTimestamp(dateToTimestamp(date)));
        return this;
    }

    public addKey(key: Ed25519PublicKey): this {
        const keylist: KeyList = this._body.getKeys() == null ? new KeyList() : this._body.getKeys()!;
        keylist.addKeys(key._toProtoKey());
        this._body.setKeys(keylist);
        return this;
    }

    public setContents(bytes: Uint8Array | string): this {
        this._body.setContents(bytes);
        return this;
    }

    protected _doValidate(errors: string[]): void {
        const files = this._body.getKeys();

        if (files == null) {
            errors.push('FileCreateTransaction must have a file set');
            return;
        }
    }

    public get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.createFile;
    }
}
