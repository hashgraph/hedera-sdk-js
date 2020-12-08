import { keyFromProtobuf, keyToProtobuf } from "../cryptography/protobuf.js";
import AccountId from "../account/AccountId.js";
import Transaction, {
    DEFAULT_AUTO_RENEW_PERIOD,
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import Duration from "../Duration.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IConsensusCreateTopicTransactionBody} proto.IConsensusCreateTopicTransactionBody
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").ISignedTransaction} proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 */

/**
 * @typedef {import("@hashgraph/cryptography").Key} Key
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * Create a topic to be used for consensus.
 */
export default class TopicCreateTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {string} [props.topicMemo]
     * @param {Key} [props.adminKey]
     * @param {Key} [props.submitKey]
     * @param {Duration | Long | number} [props.autoRenewPeriod]
     * @param {AccountId | string} [props.autoRenewAccountId]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?string}
         */
        this._topicMemo = null;

        if (props.topicMemo != null) {
            this.setTopicMemo(props.topicMemo);
        }

        /**
         * @private
         * @type {?Key}
         */
        this._adminKey = null;

        if (props.adminKey != null) {
            this.setAdminKey(props.adminKey);
        }

        /**
         * @private
         * @type {?Key}
         */
        this._submitKey = null;

        if (props.submitKey != null) {
            this.setSubmitKey(props.submitKey);
        }

        /**
         * @private
         * @type {?AccountId}
         */
        this._autoRenewAccountId = null;

        if (props.autoRenewAccountId != null) {
            this.setAutoRenewAccountId(props.autoRenewAccountId);
        }

        /**
         * @private
         * @type {Duration}
         */
        this._autoRenewPeriod = new Duration(DEFAULT_AUTO_RENEW_PERIOD);

        if (props.autoRenewPeriod != null) {
            this.setAutoRenewPeriod(props.autoRenewPeriod);
        }
    }

    /**
     * @internal
     * @param {proto.ITransaction[]} transactions
     * @param {proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {proto.ITransactionBody[]} bodies
     * @returns {TopicCreateTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];
        const create = /** @type {proto.IConsensusCreateTopicTransactionBody} */ (body.consensusCreateTopic);

        return Transaction._fromProtobufTransactions(
            new TopicCreateTransaction({
                topicMemo: create.memo != null ? create.memo : undefined,
                adminKey:
                    create.adminKey != null
                        ? keyFromProtobuf(create.adminKey)
                        : undefined,
                submitKey:
                    create.submitKey != null
                        ? keyFromProtobuf(create.submitKey)
                        : undefined,
                autoRenewAccountId:
                    create.autoRenewAccount != null
                        ? AccountId._fromProtobuf(create.autoRenewAccount)
                        : undefined,
                autoRenewPeriod:
                    create.autoRenewPeriod != null
                        ? create.autoRenewPeriod.seconds != null
                            ? create.autoRenewPeriod.seconds
                            : undefined
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
     * @returns {?string}
     */
    get topicMemo() {
        return this._topicMemo;
    }

    /**
     * @param {string} topicMemo
     * @returns {this}
     */
    setTopicMemo(topicMemo) {
        this._requireNotFrozen();
        this._topicMemo = topicMemo;

        return this;
    }

    /**
     * @returns {?Key}
     */
    get adminKey() {
        return this._adminKey;
    }

    /**
     * @param {Key} adminKey
     * @returns {this}
     */
    setAdminKey(adminKey) {
        this._requireNotFrozen();
        this._adminKey = adminKey;

        return this;
    }

    /**
     * @returns {?Key}
     */
    get submitKey() {
        return this._submitKey;
    }

    /**
     * @param {Key} submitKey
     * @returns {this}
     */
    setSubmitKey(submitKey) {
        this._requireNotFrozen();
        this._submitKey = submitKey;

        return this;
    }

    /**
     * @returns {?AccountId}
     */
    get autoRenewAccountId() {
        return this._autoRenewAccountId;
    }

    /**
     * @param {AccountId | string} autoRenewAccountId
     * @returns {this}
     */
    setAutoRenewAccountId(autoRenewAccountId) {
        this._requireNotFrozen();
        this._autoRenewAccountId =
            autoRenewAccountId instanceof AccountId
                ? autoRenewAccountId
                : AccountId.fromString(autoRenewAccountId);

        return this;
    }

    /**
     * @returns {Duration}
     */
    get autoRenewPeriod() {
        return this._autoRenewPeriod;
    }

    /**
     * Set the auto renew period for this account.
     *
     * @param {Duration | Long | number} autoRenewPeriod
     * @returns {this}
     */
    setAutoRenewPeriod(autoRenewPeriod) {
        this._requireNotFrozen();
        this._autoRenewPeriod =
            autoRenewPeriod instanceof Duration
                ? autoRenewPeriod
                : new Duration(autoRenewPeriod);

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
        return channel.consensus.createTopic(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "consensusCreateTopic";
    }

    /**
     * @override
     * @protected
     * @returns {proto.IConsensusCreateTopicTransactionBody}
     */
    _makeTransactionData() {
        return {
            adminKey:
                this._adminKey != null ? keyToProtobuf(this._adminKey) : null,
            submitKey:
                this._submitKey != null ? keyToProtobuf(this._submitKey) : null,
            memo: this._topicMemo,
            autoRenewAccount:
                this._autoRenewAccountId != null
                    ? this._autoRenewAccountId._toProtobuf()
                    : null,
            autoRenewPeriod: this._autoRenewPeriod._toProtobuf(),
        };
    }
}

TRANSACTION_REGISTRY.set(
    "consensusCreateTopic",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TopicCreateTransaction._fromProtobuf
);
