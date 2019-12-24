import { TransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";

import { FileService } from "../generated/FileService_pb_service";
import { KeyList } from "../generated/BasicTypes_pb";
import { FileUpdateTransactionBody } from "../generated/FileUpdate_pb";
import { FileId, FileIdLike } from "../file/FileId";
import { dateToTimestamp, timestampToProto } from "../Timestamp";
import { PublicKey } from "../crypto/PublicKey";

export class FileUpdateTransaction extends TransactionBuilder {
    private readonly _body: FileUpdateTransactionBody;

    public constructor() {
        super();
        this._body = new FileUpdateTransactionBody();
        this._inner.setFileupdate(this._body);
    }

    public setExpirationTime(date: number | Date): this {
        this._body.setExpirationtime(timestampToProto(dateToTimestamp(date)));
        return this;
    }

    public addKey(key: PublicKey): this {
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
            Uint8Array.from(new TextEncoder().encode(contents as string));

        this._body.setContents(bytes);
        return this;
    }

    public setFileId(fileIdLike: FileIdLike): this {
        this._body.setFileid(new FileId(fileIdLike)._toProto());
        return this;
    }

    protected _doValidate(errors: string[]): void {
        const files = this._body.getKeys();

        if (files == null) {
            errors.push("FileUpdateTransaction must have a file set");
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.updateFile;
    }
}
