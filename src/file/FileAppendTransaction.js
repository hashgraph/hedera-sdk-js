/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2023 Hedera Hashgraph, LLC
 * ​
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ‍
 */

import Hbar from "../Hbar.js";
import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import * as utf8 from "../encoding/utf8.js";
import FileId from "./FileId.js";
import TransactionId from "../transaction/TransactionId.js";
import Timestamp from "../Timestamp.js";
import List from "../transaction/List.js";
import * as HashgraphProto from "@hashgraph/proto";
import AccountId from "../account/AccountId.js";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<Channel, *>} Client
 * @typedef {import("../transaction/TransactionResponse.js").default} TransactionResponse
 * @typedef {import("../schedule/ScheduleCreateTransaction.js").default} ScheduleCreateTransaction
 */

/**
 * A transaction specifically to append data to a file on the network.
 *
 * If a file has multiple keys, all keys must sign to modify its contents.
 */
export default class FileAppendTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {FileId | string} [props.fileId]
     * @param {Uint8Array | string} [props.contents]
     * @param {number} [props.maxChunks]
     * @param {number} [props.chunkSize]
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
         * @type {?Uint8Array}
         */
        this._contents = null;

        /**
         * @private
         * @type {number}
         */
        this._maxChunks = 20;

        /**
         * @private
         * @type {number}
         */
        this._chunkSize = 4096;

        this._defaultMaxTransactionFee = new Hbar(5);

        if (props.fileId != null) {
            this.setFileId(props.fileId);
        }

        if (props.contents != null) {
            this.setContents(props.contents);
        }

        if (props.maxChunks != null) {
            this.setMaxChunks(props.maxChunks);
        }

        if (props.chunkSize != null) {
            this.setChunkSize(props.chunkSize);
        }

        /** @type {List<TransactionId>} */
        this._transactionIds = new List();
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ITransaction[]} transactions
     * @param {HashgraphProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HashgraphProto.proto.ITransactionBody[]} bodies
     * @returns {FileAppendTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies,
    ) {
        const body = bodies[0];
        const append =
            /** @type {HashgraphProto.proto.IFileAppendTransactionBody} */ (
                body.fileAppend
            );

        let contents;

        // The increment value depends on whether the node IDs list is empty or not.
        // The node IDs list is not empty if the transaction has been frozen
        // before serialization and deserialization, otherwise, it's empty.
        const incrementValue = nodeIds.length > 0 ? nodeIds.length : 1;

        for (let i = 0; i < bodies.length; i += incrementValue) {
            const fileAppend =
                /** @type {HashgraphProto.proto.IFileAppendTransactionBody} */ (
                    bodies[i].fileAppend
                );
            if (fileAppend.contents == null) {
                break;
            }

            if (contents == null) {
                contents = new Uint8Array(
                    /** @type {Uint8Array} */ (fileAppend.contents),
                );
                continue;
            }

            /** @type {Uint8Array} */
            const concat = new Uint8Array(
                contents.length +
                    /** @type {Uint8Array} */ (fileAppend.contents).length,
            );
            concat.set(contents, 0);
            concat.set(
                /** @type {Uint8Array} */ (fileAppend.contents),
                contents.length,
            );
            contents = concat;
        }

        return Transaction._fromProtobufTransactions(
            new FileAppendTransaction({
                fileId:
                    append.fileID != null
                        ? FileId._fromProtobuf(
                              /** @type {HashgraphProto.proto.IFileID} */ (
                                  append.fileID
                              ),
                          )
                        : undefined,
                contents: contents,
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies,
        );
    }

    /**
     * @returns {?FileId}
     */
    get fileId() {
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
            typeof fileId === "string"
                ? FileId.fromString(fileId)
                : fileId.clone();

        return this;
    }

    /**
     * @returns {?Uint8Array}
     */
    get contents() {
        return this._contents;
    }

    /**
     * Set the given byte array as the file's contents.
     *
     * This may be omitted to append an empty file.
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
     * @returns {?number}
     */
    get maxChunks() {
        return this._maxChunks;
    }

    /**
     * @param {number} maxChunks
     * @returns {this}
     */
    setMaxChunks(maxChunks) {
        this._requireNotFrozen();
        this._maxChunks = maxChunks;
        return this;
    }

    /**
     * @returns {?number}
     */
    get chunkSize() {
        return this._chunkSize;
    }

    /**
     * @param {number} chunkSize
     * @returns {this}
     */
    setChunkSize(chunkSize) {
        this._chunkSize = chunkSize;
        return this;
    }

    /**
     * Freeze this transaction from further modification to prepare for
     * signing or serialization.
     *
     * Will use the `Client`, if available, to generate a default Transaction ID and select 1/3
     * nodes to prepare this transaction for.
     *
     * @param {?import("../client/Client.js").default<Channel, *>} client
     * @returns {this}
     */
    freezeWith(client) {
        super.freezeWith(client);

        if (this._contents == null) {
            return this;
        }

        const chunks = Math.floor(
            (this._contents.length + (this._chunkSize - 1)) / this._chunkSize,
        );

        if (chunks > this._maxChunks) {
            throw new Error(
                `Contents with size ${this._contents.length} too long for ${this._maxChunks} chunks`,
            );
        }

        let nextTransactionId = this._getTransactionId();

        // Hack around the locked list. Should refactor a bit to remove such code
        this._transactionIds.locked = false;

        this._transactions.clear();
        this._transactionIds.clear();
        this._signedTransactions.clear();

        for (let chunk = 0; chunk < chunks; chunk++) {
            this._transactionIds.push(nextTransactionId);
            this._transactionIds.advance();

            for (const nodeAccountId of this._nodeAccountIds.list) {
                this._signedTransactions.push(
                    this._makeSignedTransaction(nodeAccountId),
                );
            }

            nextTransactionId = new TransactionId(
                /** @type {AccountId} */ (nextTransactionId.accountId),
                new Timestamp(
                    /** @type {Timestamp} */ (
                        nextTransactionId.validStart
                    ).seconds,
                    /** @type {Timestamp} */ (
                        nextTransactionId.validStart
                    ).nanos.add(1),
                ),
            );
        }

        this._transactionIds.advance();
        this._transactionIds.setLocked();

        return this;
    }

    /**
     * @returns {ScheduleCreateTransaction}
     */
    schedule() {
        this._requireNotFrozen();

        if (this._contents != null && this._contents.length > this._chunkSize) {
            throw new Error(
                `cannot schedule \`FileAppendTransaction\` with message over ${this._chunkSize} bytes`,
            );
        }

        return super.schedule();
    }

    /**
     * @param {import("../client/Client.js").default<Channel, *>} client
     * @param {number=} requestTimeout
     * @returns {Promise<TransactionResponse>}
     */
    async execute(client, requestTimeout) {
        return (await this.executeAll(client, requestTimeout))[0];
    }

    /**
     * @param {import("../client/Client.js").default<Channel, *>} client
     * @param {number=} requestTimeout
     * @returns {Promise<TransactionResponse[]>}
     */
    async executeAll(client, requestTimeout) {
        if (!super._isFrozen()) {
            this.freezeWith(client);
        }

        // on execute, sign each transaction with the operator, if present
        // and we are signing a transaction that used the default transaction ID

        const transactionId = this._getTransactionId();
        const operatorAccountId = client.operatorAccountId;

        if (
            operatorAccountId != null &&
            operatorAccountId.equals(
                /** @type {AccountId} */ (transactionId.accountId),
            )
        ) {
            await super.signWithOperator(client);
        }

        const responses = [];
        let remainingTimeout = requestTimeout;

        for (let i = 0; i < this._transactionIds.length; i++) {
            const startTimestamp = Date.now();
            const response = await super.execute(client, remainingTimeout);

            if (remainingTimeout != null) {
                remainingTimeout = Date.now() - startTimestamp;
            }

            await response.getReceipt(client);
            responses.push(response);
        }

        return responses;
    }

    /**
     * @param {Client} client
     */
    _validateChecksums(client) {
        if (this._fileId != null) {
            this._fileId.validateChecksum(client);
        }
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {HashgraphProto.proto.ITransaction} request
     * @returns {Promise<HashgraphProto.proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.file.appendContent(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<HashgraphProto.proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "fileAppend";
    }

    /**
     * @override
     * @returns {Uint8Array}
     */
    toBytes() {
        if (this._contents == null) {
            throw new Error("contents is not set");
        }

        const chunks = Math.floor(
            (this._contents.length + (this._chunkSize - 1)) / this._chunkSize,
        );

        if (chunks > this._maxChunks) {
            throw new Error(
                `Contents with size ${this._contents.length} too long for ${this._maxChunks} chunks`,
            );
        }

        let nextTransactionId = TransactionId.withValidStart(
            new AccountId(0, 0, 0),
            new Timestamp(new Date().getTime(), 0),
        );

        // Hack around the locked list. Should refactor a bit to remove such code
        this._transactionIds.locked = false;

        this._transactions.clear();
        this._transactionIds.clear();
        this._signedTransactions.clear();

        for (let chunk = 0; chunk < chunks; chunk++) {
            this._transactionIds.push(nextTransactionId);
            this._transactionIds.advance();

            this._signedTransactions.push(this._makeSignedTransaction(null));

            nextTransactionId = new TransactionId(
                /** @type {AccountId} */ (nextTransactionId.accountId),
                new Timestamp(
                    /** @type {Timestamp} */ (
                        nextTransactionId.validStart
                    ).seconds,
                    /** @type {Timestamp} */ (
                        nextTransactionId.validStart
                    ).nanos.add(1),
                ),
            );
        }

        this._transactionIds.advance();
        this._transactionIds.setLocked();

        return HashgraphProto.proto.TransactionList.encode({
            transactionList:
                /** @type {HashgraphProto.proto.ITransaction[]} */
                (this._signedTransactions.list),
        }).finish();
    }

    /**
     * Deserialize a transaction from bytes. The bytes can only
     * be of type FileAppendTransaction
     * @param {Uint8Array} bytes
     * @returns {FileAppendTransaction}
     */
    static fromBytes(bytes) {
        /** @type {HashgraphProto.proto.ISignedTransaction[]} */
        const signedTransactions = [];

        /** @type {TransactionId[]} */
        const transactionIds = [];

        /** @type {AccountId[]} */
        const nodeIds = [];

        /** @type {string[]} */
        const transactionIdStrings = [];

        /** @type {string[]} */
        const nodeIdStrings = [];

        /** @type {HashgraphProto.proto.TransactionBody[]} */
        const bodies = [];

        const list =
            HashgraphProto.proto.TransactionList.decode(bytes).transactionList;

        // This loop is responsible for fill out the `signedTransactions`, `transactionIds`,
        // `nodeIds`, and `bodies` variables.
        for (const transaction of list) {
            // The `bodyBytes` or `signedTransactionBytes` should not be null
            if (
                transaction.bodyBytes == null &&
                transaction.signedTransactionBytes == null
            ) {
                throw new Error(
                    "bodyBytes and signedTransactionBytes are null",
                );
            }

            if (transaction.bodyBytes && transaction.bodyBytes.length != 0) {
                // Decode a transaction
                const body = HashgraphProto.proto.TransactionBody.decode(
                    transaction.bodyBytes,
                );

                // Make sure the transaction ID within the body is set
                if (body.transactionID != null) {
                    const transactionId = TransactionId._fromProtobuf(
                        /** @type {HashgraphProto.proto.ITransactionID} */ (
                            body.transactionID
                        ),
                    );

                    // If we haven't already seen this transaction ID in the list, add it
                    if (
                        !transactionIdStrings.includes(transactionId.toString())
                    ) {
                        transactionIds.push(transactionId);
                        transactionIdStrings.push(transactionId.toString());
                    }
                }

                // Make sure the node account ID within the body is set
                if (body.nodeAccountID != null) {
                    const nodeAccountId = AccountId._fromProtobuf(
                        /** @type {HashgraphProto.proto.IAccountID} */ (
                            body.nodeAccountID
                        ),
                    );

                    // If we haven't already seen this node account ID in the list, add it
                    if (!nodeIdStrings.includes(nodeAccountId.toString())) {
                        nodeIds.push(nodeAccountId);
                        nodeIdStrings.push(nodeAccountId.toString());
                    }
                }

                // Make sure the body is set
                if (body.data == null) {
                    throw new Error(
                        "(BUG) body.data was not set in the protobuf",
                    );
                }
                bodies.push(body);
            }

            if (
                transaction.signedTransactionBytes &&
                transaction.signedTransactionBytes.length != 0
            ) {
                // Decode a signed transaction
                const signedTransaction =
                    HashgraphProto.proto.SignedTransaction.decode(
                        transaction.signedTransactionBytes,
                    );

                signedTransactions.push(signedTransaction);

                // Decode a transaction body
                const body = HashgraphProto.proto.TransactionBody.decode(
                    signedTransaction.bodyBytes,
                );

                // Make sure the transaction ID within the body is set
                if (body.transactionID != null) {
                    const transactionId = TransactionId._fromProtobuf(
                        /** @type {HashgraphProto.proto.ITransactionID} */ (
                            body.transactionID
                        ),
                    );

                    // If we haven't already seen this transaction ID in the list, add it
                    if (
                        !transactionIdStrings.includes(transactionId.toString())
                    ) {
                        transactionIds.push(transactionId);
                        transactionIdStrings.push(transactionId.toString());
                    }
                }

                // Make sure the node account ID within the body is set
                if (body.nodeAccountID != null) {
                    const nodeAccountId = AccountId._fromProtobuf(
                        /** @type {HashgraphProto.proto.IAccountID} */ (
                            body.nodeAccountID
                        ),
                    );

                    // If we haven't already seen this node account ID in the list, add it
                    if (!nodeIdStrings.includes(nodeAccountId.toString())) {
                        nodeIds.push(nodeAccountId);
                        nodeIdStrings.push(nodeAccountId.toString());
                    }
                }

                // Make sure the body is set
                if (body.data == null) {
                    throw new Error(
                        "(BUG) body.data was not set in the protobuf",
                    );
                }

                bodies.push(body);
            }
        }

        let buffers = [];
        for (const body of bodies) {
            if (body.fileAppend?.contents) {
                buffers.push(body.fileAppend?.contents);
            }
        }

        const contents = Buffer.concat(buffers);
        let fileId;
        if (bodies[0].fileAppend?.fileID) {
            fileId = FileId._fromProtobuf(bodies[0].fileAppend.fileID);
        } else {
            throw new Error("fileID is required");
        }

        return new FileAppendTransaction({
            fileId: fileId,
            contents: contents,
        });
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        const timestamp = /** @type {import("../Timestamp.js").default} */ (
            this._transactionIds.current.validStart
        );
        return `FileAppendTransaction:${timestamp.toString()}`;
    }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
TRANSACTION_REGISTRY.set("fileAppend", FileAppendTransaction._fromProtobuf);
