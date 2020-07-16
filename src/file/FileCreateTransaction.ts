import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";

import { FileService } from "../generated/FileService_pb_service";
import { FileCreateTransactionBody } from "../generated/FileCreate_pb";
import { KeyList } from "../generated/BasicTypes_pb";
import { dateToTimestamp, timestampToProto } from "../Timestamp";
import { Ed25519PublicKey } from "../crypto/Ed25519PublicKey";
import * as utf8 from "@stablelib/utf8";

/**
 * Create a new file, containing the given contents.  It is referenced by its FileID, and does not
 * have a filename, so it is important to get the FileID. After the file is created, the FileID
 * for it can be found in the receipt, or retrieved with a GetByKey query, or by asking for a Record
 * of the transaction to be created, and retrieving that.
 *
 * The file contains the given contents (possibly empty). The file will automatically disappear at
 * the fileExpirationTime, unless its expiration is extended by another transaction before that
 * time. If the file is deleted, then its contents will become empty and it will be marked as deleted
 * until it expires, and then it will cease to exist. See FileGetInfoQuery for more information
 * about files.
 *
 * The keys field is a list of keys. All the keys on the list must sign to create or modify a file,
 * but only one of them needs to sign in order to delete the file.  Each of those "keys" may itself
 * be threshold key containing other keys (including other threshold keys). In other words, the
 * behavior is an AND for create/modify, OR for delete. This is useful for acting as a revocation
 * server. If it is desired to have the behavior be AND for all 3 operations (or OR for all 3),
 * then the list should have only a single Key, which is a threshold key, with N=1 for OR,
 * N=M for AND.
 *
 * If a file is created without ANY keys in the keys field, the file is immutable ONLY the
 * expirationTime of the file can be changed using FileUpdate API. The file contents or its keys
 * cannot be changed.
 *
 * An entity (account, file, or smart contract instance) must be created in a particular realm. If
 * the realmID is left null, then a new realm will be created with the given admin key. If a new
 * realm has a null adminKey, then anyone can create/modify/delete entities in that realm. But if
 * an admin key is given, then any transaction to create/modify/delete an entity in that realm
 * must be signed by that key, though anyone can still call functions on smart contract instances
 * that exist in that realm. A realm ceases to exist when everything within it has expired
 * and no longer exists.
 *
 * The current API ignores shardID, realmID, and newRealmAdminKey, and creates everything in
 * shard 0 and realm 0, with a null key. Future versions of the API will support multiple
 * realms and multiple shards.
 */
export class FileCreateTransaction extends SingleTransactionBuilder {
    private readonly _body: FileCreateTransactionBody;

    public constructor() {
        super();
        this._body = new FileCreateTransactionBody();
        this.setExpirationTime(Date.now() + 7890000000);
        this._inner.setFilecreate(this._body);
    }

    /**
     * The time at which this file should expire (unless FileUpdateTransaction is used before
     * then to extend its life).
     */
    public setExpirationTime(date: number | Date): this {
        this._body.setExpirationtime(timestampToProto(dateToTimestamp(date)));
        return this;
    }

    /**
     * Add a key.
     *
     * All these keys must sign to create or modify the file. Any one of them can sign to delete the file.
     */
    public addKey(key: Ed25519PublicKey): this {
        const keylist: KeyList = this._body.getKeys() == null ?
            new KeyList() :
            this._body.getKeys()!;

        keylist.addKeys(key._toProtoKey());
        this._body.setKeys(keylist);
        return this;
    }

    /**
     * The bytes that are the contents of the file.
     */
    public setContents(contents: Uint8Array | string): this {
        const bytes = contents instanceof Uint8Array ?
            contents as Uint8Array :
            utf8.encode(contents as string);

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
