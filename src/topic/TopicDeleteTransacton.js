import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import TopicId from "./TopicId.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IConsensusDeleteTopicTransactionBody} proto.IConsensusDeleteTopicTransactionBody
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../account/AccountId.js").default} AccountId
 */

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
     * @param {Map<string, Map<AccountId, proto.ITransaction>>} transactions
     * @param {proto.TransactionBody} body
     * @returns {TopicDeleteTransaction}
     */
    static _fromProtobuf(transactions, body) {
        const topicDelete = /** @type {proto.IConsensusDeleteTopicTransactionBody} */ (body.consensusDeleteTopic);

        return Transaction._fromProtobufTransactions(
            new TopicDeleteTransaction({
                topicId:
                    topicDelete.topicID != null
                        ? TopicId._fromProtobuf(topicDelete.topicID)
                        : undefined,
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
     * @internal
     * @param {Channel} channel
     * @param {proto.ITransaction} request
     * @returns {Promise<proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.consensus.deleteTopic(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
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
            topicID: this._topicId != null ? this._topicId._toProtobuf() : null,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "consensusDeleteTopic",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TopicDeleteTransaction._fromProtobuf
);
