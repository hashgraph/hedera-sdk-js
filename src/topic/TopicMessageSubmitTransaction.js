import Transaction, {
    TRANSACTION_REGISTRY,
    CHUNK_SIZE,
} from "../transaction/Transaction.js";
import TopicId from "./TopicId.js";
import * as utf8 from "../encoding/utf8.js";
import TransactionId from "../transaction/TransactionId.js";
import Timestamp from "../Timestamp.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IConsensusSubmitMessageTransactionBody} proto.IConsensusSubmitMessageTransactionBody
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").IConsensusMessageChunkInfo} proto.IConsensusMessageChunkInfo
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("../transaction/TransactionResponse.js").default} TransactionResponse
 */

export default class TopicMessageSubmitTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {TopicId} [props.topicId]
     * @param {Uint8Array | string} [props.message]
     * @param {number} [props.maxChunks]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?TopicId}
         */
        this._topicId = null;

        if (props.topicId != null) {
            this.setTopicId(props.topicId);
        }

        /**
         * @private
         * @type {?Uint8Array}
         */
        this._message = null;

        if (props.message != null) {
            this.setMessage(props.message);
        }

        /**
         * @private
         * @type {number}
         */
        this._maxChunks = 10;

        if (props.maxChunks != null) {
            this.setMaxChunks(props.maxChunks);
        }

        /** @type {proto.IConsensusMessageChunkInfo | null} */
        this._chunkInfo = null;
    }

    /**
     * @internal
     * @param {Map<string, Map<AccountId, proto.ITransaction>>} transactions
     * @param {proto.TransactionBody} body
     * @returns {TopicMessageSubmitTransaction}
     */
    static _fromProtobuf(transactions, body) {
        const message = /** @type {proto.IConsensusSubmitMessageTransactionBody} */ (body.consensusSubmitMessage);

        return Transaction._fromProtobufTransactions(
            new TopicMessageSubmitTransaction({
                topicId:
                    message.topicID != null
                        ? TopicId._fromProtobuf(message.topicID)
                        : undefined,
                message: message.message != null ? message.message : undefined,
            }),
            transactions,
            body
        );
    }

    /**
     * @returns {?TopicId}
     */
    get topicId() {
        return this._topicId;
    }

    /**
     * @param {TopicId} topicId
     * @returns {this}
     */
    setTopicId(topicId) {
        this._requireNotFrozen();
        this._topicId = topicId;

        return this;
    }

    /**
     * @returns {?Uint8Array}
     */
    get message() {
        return this._message;
    }

    /**
     * @param {string | Uint8Array} message
     * @returns {this}
     */
    setMessage(message) {
        this._requireNotFrozen();
        this._message =
            typeof message === "string" ? utf8.encode(message) : message;

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

        if (this._message == null) {
            return this;
        }

        if (this._message.length < CHUNK_SIZE) {
            return this;
        }

        const chunks = (this._message.length + (CHUNK_SIZE - 1)) / CHUNK_SIZE;

        if (chunks > this._maxChunks) {
            throw new Error(
                `Message with size ${this._message.length} too long for ${this._maxChunks} chunks`
            );
        }

        if (this._transactionId == null) {
            throw new Error("TransactionId not set when freezing");
        }

        super._transactions = [];

        const initialTransactionId = this._transactionId._toProtobuf();
        let nextTransactionId = TransactionId._fromProtobuf(
            initialTransactionId
        );

        for (let chunk = 0; chunk < chunks; chunk++) {
            this._chunkInfo = {
                initialTransactionID: initialTransactionId,
                total: chunks,
                number: chunk + 1,
            };

            super._transactionId = nextTransactionId;

            for (const nodeAccountId of this._nodeIds) {
                this._transactions.push(this._makeTransaction(nodeAccountId));
            }

            nextTransactionId = new TransactionId(
                nextTransactionId.accountId,
                new Timestamp(
                    nextTransactionId.validStart.seconds,
                    nextTransactionId.validStart.nanos.add(1)
                )
            );
        }

        super._transactionId = TransactionId._fromProtobuf(
            initialTransactionId
        );
        this._chunkInfo = null;

        return this;
    }

    /**
     * @param {import("../client/Client.js").default<*, *>} client
     * @returns {Promise<TransactionResponse>}
     */
    async execute(client) {
        return (await this.executeAll(client))[0];
    }

    /**
     * @param {import("../client/Client.js").default<*, *>} client
     * @returns {Promise<TransactionResponse[]>}
     */
    async executeAll(client) {
        if (!super._isFrozen()) {
            this.freezeWith(client);
        }

        // on execute, sign each transaction with the operator, if present
        // and we are signing a transaction that used the default transaction ID

        const transactionId = this.transactionId;
        const operatorAccountId = client.operatorAccountId;

        if (
            operatorAccountId != null &&
            operatorAccountId.equals(transactionId.accountId)
        ) {
            await super.signWithOperator(client);
        }

        const transactionCount =
            this._transactions.length / this._nodeIds.length;
        const responses = [];
        for (
            this._nextGroupIndex = 0;
            this._nextGroupIndex < transactionCount;
            this._nextGroupIndex++
        ) {
            responses.push(await super.execute(client));
        }

        return responses;
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {proto.ITransaction} request
     * @returns {Promise<proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.consensus.submitMessage(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "consensusSubmitMessage";
    }

    /**
     * @override
     * @protected
     * @returns {proto.IConsensusSubmitMessageTransactionBody}
     */
    _makeTransactionData() {
        if (this._chunkInfo != null && this._message != null) {
            const startIndex =
                ((this._chunkInfo.number != null ? this._chunkInfo.number : 0) -
                    1) *
                CHUNK_SIZE;

            let endIndex = startIndex + CHUNK_SIZE;
            if (endIndex > this._message.length) {
                endIndex = this._message.length;
            }

            return {
                topicID:
                    this._topicId != null ? this._topicId._toProtobuf() : null,
                message: this._message.slice(startIndex, endIndex),
                chunkInfo: this._chunkInfo,
            };
        } else {
            return {
                topicID:
                    this._topicId != null ? this._topicId._toProtobuf() : null,
                message: this._message,
            };
        }
    }
}

TRANSACTION_REGISTRY.set(
    "consensusSubmitMessage",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TopicMessageSubmitTransaction._fromProtobuf
);
