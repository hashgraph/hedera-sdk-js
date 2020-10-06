import Transaction, { TRANSACTION_REGISTRY } from "../transaction/Transaction";
import TopicId from "./TopicId";
import * as utf8 from "../encoding/utf8";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IConsensusSubmitMessageTransactionBody} proto.IConsensusSubmitMessageTransactionBody
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 */

/**
 * @typedef {import("../channel/Channel").default} Channel
 */

export default class TopicMessageSubmitTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {TopicId} [props.topicId]
     * @param {Uint8Array | string} [props.message]
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
    }

    /**
     * @internal
     * @param {proto.TransactionBody} body
     * @returns {TopicMessageSubmitTransaction}
     */
    static _fromProtobuf(body) {
        const message = /** @type {proto.IConsensusSubmitMessageTransactionBody} */ (body.consensusSubmitMessage);

        return new TopicMessageSubmitTransaction({
            topicId:
                message.topicID != null
                    ? TopicId._fromProtobuf(message.topicID)
                    : undefined,
            message: message.message != null ? message.message : undefined,
        });
    }

    /**
     * @returns {?TopicId}
     */
    get topicId() {
        return this._topicId;
    }

    /**
     * @param {TopicId} topicId
     * @returns {TopicMessageSubmitTransaction}
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
     * @returns {TopicMessageSubmitTransaction}
     */
    setMessage(message) {
        this._requireNotFrozen();
        this._message =
            typeof message === "string" ? utf8.encode(message) : message;

        return this;
    }

    /**
     * @override
     * @protected
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
        return {
            topicID: this._topicId != null ? this._topicId._toProtobuf() : null,
            message: this._message,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "consensusSubmitMessage",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TopicMessageSubmitTransaction._fromProtobuf
);
