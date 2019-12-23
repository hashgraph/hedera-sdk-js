import { TransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";

import { FileService } from "../generated/FileService_pb_service";
import { FileCreateTransactionBody } from "../generated/FileCreate_pb";
import { KeyList } from "../generated/BasicTypes_pb";
import { dateToTimestamp, timestampToProto } from "../Timestamp";
import { Ed25519PublicKey } from "../crypto/Ed25519PublicKey";

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

    public setContents(bytes: Uint8Array): this {
        this._body.setContents(bytes);
        return this;
    }

    protected _doValidate(errors: string[]): void { 
        // No local validation
    }

    protected get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.createFile;
    }
}
