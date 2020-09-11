import proto from "@hashgraph/proto";
import Channel from "../Channel";
import Transaction, { TRANSACTION_REGISTRY } from "../Transaction";
import { _toProtoKey } from "../util";
import FileId from "./FileId";

/**
 * A transaction to delete a file on the Hedera network.
 *
 * When deleted, a file's contents are truncated to zero length and it can no longer be updated
 * or appended to, or its expiration time extended. FileContentsQuery and FileInfoQuery
 * will throw HederaPreCheckStatusException with a status of Status#FileDeleted.
 *
 * Only one of the file's keys needs to sign to delete the file, unless the key you have is part
 * of a KeyList.
 */
export default class FileDeleteTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {FileId | string} [props.fileId]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?FileId}
         */
        this._fileId = null;

        if (props.fileId != null) {
            this.setFileId(props.fileId);
        }
    }

    /**
     * @internal
     * @param {proto.TransactionBody} body
     * @returns {FileDeleteTransaction}
     */
    static _fromProtobuf(body) {
        const fileDelete = /** @type {proto.IFileDeleteTransactionBody} */ (body.fileDelete);

        return new FileDeleteTransaction({
            fileId:
                fileDelete.fileID != null
                    ? FileId._fromProtobuf(fileDelete.fileID)
                    : undefined,
        });
    }

    /**
     * @returns {?FileId}
     */
    getFileId() {
        return this._fileId;
    }

    /**
     * Set the file ID which is being deleted in this transaction.
     *
     * @param {FileId | string} fileId
     * @returns {FileDeleteTransaction}
     */
    setFileId(fileId) {
        this._requireNotFrozen();
        this._fileId =
            fileId instanceof FileId ? fileId : FileId.fromString(fileId);

        return this;
    }

    /**
     * @override
     * @protected
     * @param {Channel} channel
     * @returns {(transaction: proto.ITransaction) => Promise<proto.TransactionResponse>}
     */
    _getMethod(channel) {
        return (transaction) => channel.file.deleteFile(transaction);
    }

    /**
     * @override
     * @protected
     * @returns {proto.TransactionBody["data"]}
     */
    _getTransactionDataCase() {
        return "fileDelete";
    }

    /**
     * @override
     * @protected
     * @returns {proto.IFileDeleteTransactionBody}
     */
    _makeTransactionData() {
        return {
            fileID: this._fileId?._toProtobuf(),
        };
    }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
TRANSACTION_REGISTRY.set("fileDelete", FileDeleteTransaction._fromProtobuf);
