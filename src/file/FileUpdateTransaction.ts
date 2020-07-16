import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";

import { FileService } from "../generated/FileService_pb_service";
import { KeyList } from "../generated/BasicTypes_pb";
import { FileUpdateTransactionBody } from "../generated/FileUpdate_pb";
import { FileId, FileIdLike } from "../file/FileId";
import { dateToTimestamp, timestampToProto } from "../Timestamp";
import { PublicKey } from "../crypto/PublicKey";
import * as utf8 from "@stablelib/utf8";

/**
 * Modify some of the metadata for a file. Any null field is ignored (left unchanged). Any field
 * that is null is left unchanged. If contents is non-null, then the file's contents will be
 * replaced with the given bytes. This transaction must be signed by all the keys for that file.
 * If the transaction is modifying the keys field, then it must be signed by all the keys in both
 * the old list and the new list.
 *
 * If a file was created without ANY keys in the keys field, ONLY the expirationTime of the file
 * can be changed using this call. The file contents or its keys cannot be changed.
 */
export class FileUpdateTransaction extends SingleTransactionBuilder {
    private readonly _body: FileUpdateTransactionBody;

    public constructor() {
        super();
        this._body = new FileUpdateTransactionBody();
        this._inner.setFileupdate(this._body);
    }

    /**
     * The new time at which it should expire (ignored if not later than the current value).
     */
    public setExpirationTime(date: number | Date): this {
        this._body.setExpirationtime(timestampToProto(dateToTimestamp(date)));
        return this;
    }

    /**
     * The keys that can modify or delete the file.
     */
    public addKey(key: PublicKey): this {
        const keylist: KeyList = this._body.getKeys() == null ?
            new KeyList() :
            this._body.getKeys()!;

        keylist.addKeys(key._toProtoKey());
        this._body.setKeys(keylist);
        return this;
    }

    /**
     * The new file contents. All the bytes in the old contents are discarded.
     */
    public setContents(contents: Uint8Array | string): this {
        const bytes = contents instanceof Uint8Array ?
            contents as Uint8Array :
            utf8.encode(contents as string);

        this._body.setContents(bytes);
        return this;
    }

    /**
     * The file ID of the file to update.
     */
    public setFileId(fileIdLike: FileIdLike): this {
        this._body.setFileid(new FileId(fileIdLike)._toProto());
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected _doValidate(errors: string[]): void {
        // No validation
    }

    protected get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.updateFile;
    }
}
