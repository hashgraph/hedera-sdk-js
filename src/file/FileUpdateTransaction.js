import proto from "@hashgraph/proto";
import Channel from "../Channel";
import Transaction from "../Transaction";
import { Key } from "@hashgraph/cryptography";
import { _fromProtoKey, _toProtoKey } from "../util";
import Timestamp from "../Timestamp";
import * as utf8 from "../encoding/utf8";
import FileId from "./FileId";

/**
 * Update a new Hedera™ crypto-currency file.
 */
export default class FileUpdateTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {FileId | string} [props.fileId]
     * @param {Key[]} [props.keys]
     * @param {Timestamp} [props.expirationTime]
     * @param {Uint8Array | string} [props.contents]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?FileId}
         */
        this._fileId = null;

        /**
         * @private
         * @type {?Key[]}
         */
        this._keys = null;

        /**
         * @private
         * @type {?Timestamp}
         */
        this._expirationTime = null;

        /**
         * @private
         * @type {?Uint8Array}
         */
        this._contents = null;

        if (props.fileId != null) {
            this.setFileId(props.fileId);
        }

        if (props.keys != null) {
            this.setKeys(...props.keys);
        }

        if (props.expirationTime != null) {
            this.setExpirationTime(props.expirationTime);
        }

        if (props.contents != null) {
            this.setContents(props.contents);
        }
    }

    /**
     * @param {proto.TransactionBody} body
     * @returns {FileUpdateTransaction}
     */
    static _fromProtobuf(body) {
        const update = /** @type {proto.IFileUpdateTransactionBody} */ (body.fileUpdate);

        return new FileUpdateTransaction({
            fileId:
                update.fileID != null
                    ? FileId._fromProtobuf(update.fileID)
                    : undefined,
            keys:
                update.keys?.keys != null
                    ? update.keys.keys.map((key) => _fromProtoKey(key))
                    : undefined,
            expirationTime:
                update.expirationTime != null
                    ? Timestamp._fromProtobuf(update.expirationTime)
                    : undefined,
            contents: update.contents ?? undefined,
        });
    }

    /**
     * @returns {?FileId}
     */
    getFileId() {
        return this._fileId;
    }

    /**
     * Set the keys which must sign any transactions modifying this file. Required.
     *
     * All keys must sign to modify the file's contents or keys. No key is required
     * to sign for extending the expiration time (except the one for the operator account
     * paying for the transaction). Only one key must sign to delete the file, however.
     *
     * To require more than one key to sign to delete a file, add them to a
     * KeyList and pass that here.
     *
     * The network currently requires a file to have at least one key (or key list or threshold key)
     * but this requirement may be lifted in the future.
     *
     * @param {FileId | string} fileId
     * @returns {this}
     */
    setFileId(fileId) {
        this._requireNotFrozen();
        this._fileId =
            fileId instanceof FileId ? fileId : FileId.fromString(fileId);

        return this;
    }

    /**
     * @returns {?Key[]}
     */
    getKeys() {
        return this._keys;
    }

    /**
     * Set the keys which must sign any transactions modifying this file. Required.
     *
     * All keys must sign to modify the file's contents or keys. No key is required
     * to sign for extending the expiration time (except the one for the operator account
     * paying for the transaction). Only one key must sign to delete the file, however.
     *
     * To require more than one key to sign to delete a file, add them to a
     * KeyList and pass that here.
     *
     * The network currently requires a file to have at least one key (or key list or threshold key)
     * but this requirement may be lifted in the future.
     *
     * @param {Key[]} keys
     * @returns {this}
     */
    setKeys(...keys) {
        this._requireNotFrozen();
        this._keys = keys;

        return this;
    }

    /**
     * @returns {?Timestamp}
     */
    getExpirationTime() {
        return this._expirationTime;
    }

    /**
     * Set the instant at which this file will expire, after which its contents will no longer be
     * available.
     *
     * Defaults to 1/4 of a Julian year from the instant FileUpdateTransaction
     * was invoked.
     *
     * May be extended using FileUpdateTransaction#setExpirationTime(Timestamp).
     *
     * @param {Timestamp} expirationTime
     * @returns {this}
     */
    setExpirationTime(expirationTime) {
        this._requireNotFrozen();
        this._expirationTime = expirationTime;

        return this;
    }

    /**
     * @returns {?Uint8Array}
     */
    getContents() {
        return this._contents;
    }

    /**
     * Set the given byte array as the file's contents.
     *
     * This may be omitted to update an empty file.
     *
     * Note that total size for a given transaction is limited to 6KiB (as of March 2020) by the
     * network; if you exceed this you may receive a HederaPreCheckStatusException
     * with Status#TransactionOversize.
     *
     * In this case, you will need to break the data into chunks of less than ~6KiB and execute this
     * transaction with the first chunk and then use FileAppendTransaction with
     * FileAppendTransaction#setContents(Uint8Array) for the remaining chunks.
     *
     * @param {Uint8Array | string} contents
     * @returns {this}
     */
    setContents(contents) {
        this._requireNotFrozen();
        this._contents =
            contents instanceof Uint8Array ? contents : utf8.encode(contents);

        return this;
    }

    /**
     * @override
     * @protected
     * @param {Channel} channel
     * @returns {(transaction: proto.ITransaction) => Promise<proto.TransactionResponse>}
     */
    _getTransactionMethod(channel) {
        return (transaction) => channel.file.updateFile(transaction);
    }

    /**
     * @override
     * @protected
     * @returns {proto.TransactionBody["data"]}
     */
    _getTransactionDataCase() {
        return "fileUpdate";
    }

    /**
     * @override
     * @protected
     * @returns {proto.IFileUpdateTransactionBody}
     */
    _makeTransactionData() {
        return {
            fileID: this._fileId?._toProtobuf(),
            keys:
                this._keys != null
                    ? {
                          keys: this._keys.map((key) => _toProtoKey(key)),
                      }
                    : null,
            expirationTime: this._expirationTime?._toProtobuf(),
            contents: this._contents,
        };
    }
}
