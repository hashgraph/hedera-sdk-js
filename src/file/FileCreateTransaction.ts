import { TransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";

import { FileService } from "../generated/FileService_pb_service";
import { FileCreateTransactionBody } from "../generated/FileCreate_pb";
import { KeyList, ShardID, RealmID } from "../generated/BasicTypes_pb";
import { dateToTimestamp, timestampToProto } from "../Timestamp";
import { Ed25519PublicKey } from "../crypto/Ed25519PublicKey";
import { PublicKey } from "../crypto/PublicKey";
import { TransactionId, TransactionIdLike } from "../TransactionId";
import { utf8encode } from "../util";

export class FileCreateTransaction extends TransactionBuilder {
    private readonly _body: FileCreateTransactionBody;

    public constructor() {
        super();
        this._body = new FileCreateTransactionBody();
        this.setExpirationTime(Date.now() + 7890000000);
        this._inner.setFilecreate(this._body);
    }

    public setExpirationTime(date: number | Date): this {
        this._body.setExpirationtime(timestampToProto(dateToTimestamp(date)));
        return this;
    }

    public addKey(key: Ed25519PublicKey): this {
        const keylist: KeyList = this._body.getKeys() == null ?
            new KeyList() :
            this._body.getKeys()!;

        keylist.addKeys(key._toProtoKey());
        this._body.setKeys(keylist);
        return this;
    }

    public setContents(contents: Uint8Array | string): this {
        const bytes = contents instanceof Uint8Array ?
            contents as Uint8Array :
            utf8encode(contents as string);

        this._body.setContents(bytes);
        return this;
    }

    protected _doValidate(): void {
        // No local validation
    }

    protected get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.createFile;
    }
}
