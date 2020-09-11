import proto from "@hashgraph/proto";
import Channel from "../Channel";
import Transaction, { TRANSACTION_REGISTRY } from "../Transaction";
import TopicId from "./TopicId";

/**
 * Delete a topic.
 *
 * No more transactions or queries on the topic will succeed.
 *
 * If an adminKey is set, this transaction must be signed by that key.
 * If there is no adminKey, this transaction will fail with Status#Unautorized.
 */
export default class TopicDeleteTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {TopicId | string} [props.topicId]
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
    }

    /**
     * @internal
     * @param {proto.TransactionBody} body
     * @returns {TopicDeleteTransaction}
     */
    static _fromProtobuf(body) {
        const topicDelete = /** @type {proto.IConsensusDeleteTopicTransactionBody} */ (body.consensusDeleteTopic);

        return new TopicDeleteTransaction({
            topicId:
                topicDelete.topicID != null
                    ? TopicId._fromProtobuf(topicDelete.topicID)
                    : undefined,
        });
    }

    /**
     * @returns {?TopicId}
     */
    getTopicId() {
        return this._topicId;
    }

    /**
     * Set the topic ID which is being deleted in this transaction.
     *
     * @param {TopicId | string} topicId
     * @returns {TopicDeleteTransaction}
     */
    setTopicId(topicId) {
        this._requireNotFrozen();
        this._topicId =
            topicId instanceof TopicId ? topicId : TopicId.fromString(topicId);

        return this;
    }

    /**
     * @override
     * @protected
     * @param {Channel} channel
     * @returns {(transaction: proto.ITransaction) => Promise<proto.TransactionResponse>}
     */
    _getMethod(channel) {
        return (transaction) => channel.consensus.deleteTopic(transaction);
    }

    /**
     * @override
     * @protected
     * @returns {proto.TransactionBody["data"]}
     */
    _getTransactionDataCase() {
        return "consensusDeleteTopic";
    }

    /**
     * @override
     * @protected
     * @returns {proto.IConsensusDeleteTopicTransactionBody}
     */
    _makeTransactionData() {
        return {
            topicID: (this._topicId != null) ? this._topicId._toProtobuf() : null,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "consensusDeleteTopic",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TopicDeleteTransaction._fromProtobuf
);
