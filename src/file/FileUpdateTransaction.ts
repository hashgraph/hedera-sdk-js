import { TransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { BaseClient } from "../BaseClient";

import { FileService } from "../generated/FileService_pb_service";
import { PublicKey } from "../Keys";
import { KeyList } from "../generated/BasicTypes_pb";
import { FileUpdateTransactionBody } from "../generated/FileUpdate_pb";
import { FileIdLike, fileIdToProto } from "../types/FileId";
import { dateToTimestamp, timestampToProto } from "../types/Timestamp";

export class FileUpdateTransaction extends TransactionBuilder {
    private readonly _body: FileUpdateTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this._body = new FileUpdateTransactionBody();
        this._inner.setFileupdate(this._body);
    }

    public setExpirationTime(date: number | Date): this {
        this._body.setExpirationtime(timestampToProto(dateToTimestamp(date)));
        return this;
    }

    public addKey(key: PublicKey): this {
        const keylist: KeyList = this._body.getKeys() == null ? new KeyList() : this._body.getKeys()!;
        keylist.addKeys(key._toProtoKey());
        this._body.setKeys(keylist);
        return this;
    }

    public setContents(bytes: Uint8Array | string): this {
        this._body.setContents(bytes);
        return this;
    }

    public setFileId(fileIdLike: FileIdLike): this {
        this._body.setFileid(fileIdToProto(fileIdLike));
        return this;
    }

    protected _doValidate(errors: string[]): void {
        const files = this._body.getKeys();

        if (files == null) {
            errors.push("FileUpdateTransaction must have a file set");
        }
    }

    public get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.updateFile;
    }
}
