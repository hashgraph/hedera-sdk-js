import Transaction from "../Transaction";
import TopicId from "./TopicId";
import Channel from "../Channel";
import * as utf8 from "../encoding/utf8";
import proto from "@hashgraph/proto";

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
     * @returns {?TopicId}
     */
    getTopicId() {
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
    getMessage() {
        return this._message;
    }

    /**
     * @param {string | Uint8Array} message
     * @returns {this}
     */
    setMessage(message) {
        this._requireNotFrozen();
        this._message = typeof message === "string"
            ? utf8.encode(message)
            : message;

        return this;
    }

    /**
     * @override
     * @protected
     * @param {Channel} channel
     * @returns {(transaction: proto.ITransaction) => Promise<proto.TransactionResponse>}
     */
    _getTransactionMethod(channel) {
        return (transaction) => channel.consensus.submitMessage(transaction);
    }

    /**
     * @override
     * @protected
     * @returns {proto.TransactionBody["data"]}
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
            topicID: this._topicId?._toProtobuf(),
            message: this._message,
        };
    }
}
