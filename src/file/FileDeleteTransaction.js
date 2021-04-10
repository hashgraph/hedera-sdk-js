import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import FileId from "./FileId.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").ISignedTransaction} proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").IFileDeleteTransactionBody} proto.IFileDeleteTransactionBody
 */

/**
 * @typedef {import("@hashgraph/cryptography").Key} Key
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

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
     * @param {object} [props]
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
     * @param {proto.ITransaction[]} transactions
     * @param {proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {proto.ITransactionBody[]} bodies
     * @returns {FileDeleteTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];
        const fileDelete = /** @type {proto.IFileDeleteTransactionBody} */ (body.fileDelete);

        return Transaction._fromProtobufTransactions(
            new FileDeleteTransaction({
                fileId:
                    fileDelete.fileID != null
                        ? FileId._fromProtobuf(fileDelete.fileID)
                        : undefined,
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies
        );
    }

    /**
     * @returns {?FileId}
     */
    get fileId() {
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
     * @internal
     * @param {Channel} channel
     * @param {proto.ITransaction} request
     * @returns {Promise<proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.file.deleteFile(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
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
            fileID: this._fileId != null ? this._fileId._toProtobuf() : null,
        };
    }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
TRANSACTION_REGISTRY.set("fileDelete", FileDeleteTransaction._fromProtobuf);
