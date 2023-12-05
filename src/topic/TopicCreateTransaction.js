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

import AccountId from "../account/AccountId.js";
import Transaction, {
    DEFAULT_AUTO_RENEW_PERIOD,
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import Duration from "../Duration.js";
import Key from "../Key.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IConsensusCreateTopicTransactionBody} HashgraphProto.proto.IConsensusCreateTopicTransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HashgraphProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HashgraphProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HashgraphProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HashgraphProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HashgraphProto.proto.ITransactionResponse
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * Create a topic to be used for consensus.
 */
export default class TopicCreateTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {Key} [props.adminKey]
     * @param {Key} [props.submitKey]
     * @param {Duration | Long | number} [props.autoRenewPeriod]
     * @param {AccountId | string} [props.autoRenewAccountId]
     * @param {string} [props.topicMemo]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?Key}
         */
        this._adminKey = null;

        /**
         * @private
         * @type {?Key}
         */
        this._submitKey = null;

        /**
         * @private
         * @type {?AccountId}
         */
        this._autoRenewAccountId = null;

        /**
         * @private
         * @type {Duration}
         */
        this._autoRenewPeriod = new Duration(DEFAULT_AUTO_RENEW_PERIOD);

        /**
         * @private
         * @type {?string}
         */
        this._topicMemo = null;

        if (props.adminKey != null) {
            this.setAdminKey(props.adminKey);
        }

        if (props.submitKey != null) {
            this.setSubmitKey(props.submitKey);
        }

        if (props.autoRenewAccountId != null) {
            this.setAutoRenewAccountId(props.autoRenewAccountId);
        }

        if (props.autoRenewPeriod != null) {
            this.setAutoRenewPeriod(props.autoRenewPeriod);
        }

        if (props.topicMemo != null) {
            this.setTopicMemo(props.topicMemo);
        }
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ITransaction[]} transactions
     * @param {HashgraphProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HashgraphProto.proto.ITransactionBody[]} bodies
     * @returns {TopicCreateTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies,
    ) {
        const body = bodies[0];
        const create =
            /** @type {HashgraphProto.proto.IConsensusCreateTopicTransactionBody} */ (
                body.consensusCreateTopic
            );

        return Transaction._fromProtobufTransactions(
            new TopicCreateTransaction({
                adminKey:
                    create.adminKey != null
                        ? Key._fromProtobufKey(create.adminKey)
                        : undefined,
                submitKey:
                    create.submitKey != null
                        ? Key._fromProtobufKey(create.submitKey)
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
                topicMemo: create.memo != null ? create.memo : undefined,
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies,
        );
    }

    /**
     * @deprecated  - Use `getTopicMemo()` instead
     * @returns {?string}
     */
    get topicMemo() {
        return this._topicMemo;
    }

    /**
     * @returns {?string}
     */
    getTopicMemo() {
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
     * @deprecated  - Use `getAdminKey()` instead
     * @returns {?Key}
     */
    get adminKey() {
        return this._adminKey;
    }

    /**
     * @returns {?Key}
     */
    getAdminKey() {
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
     * @deprecated  - Use `getSubmitKey()` instead
     * @returns {?Key}
     */
    get submitKey() {
        return this._submitKey;
    }

    /**
     * @returns {?Key}
     */
    getSubmitKey() {
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
     * @deprecated  - Use `getAutoRenewAccountId()` instead
     * @returns {?AccountId}
     */
    get autoRenewAccountId() {
        return this._autoRenewAccountId;
    }

    /**
     * @returns {?AccountId}
     */
    getAutoRenewAccountId() {
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
     * @deprecated  - Use `getAutoRenewPeriod()` instead
     * @returns {Duration}
     */
    get autoRenewPeriod() {
        return this._autoRenewPeriod;
    }

    /**
     * @returns {Duration}
     */
    getAutoRenewPeriod() {
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
     * @param {Client} client
     */
    _validateChecksums(client) {
        if (this._autoRenewAccountId != null) {
            this._autoRenewAccountId.validateChecksum(client);
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
        return channel.consensus.createTopic(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<HashgraphProto.proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "consensusCreateTopic";
    }

    /**
     * @override
     * @protected
     * @returns {HashgraphProto.proto.IConsensusCreateTopicTransactionBody}
     */
    _makeTransactionData() {
        return {
            adminKey:
                this._adminKey != null ? this._adminKey._toProtobufKey() : null,
            submitKey:
                this._submitKey != null
                    ? this._submitKey._toProtobufKey()
                    : null,
            autoRenewAccount:
                this._autoRenewAccountId != null
                    ? this._autoRenewAccountId._toProtobuf()
                    : null,
            autoRenewPeriod: this._autoRenewPeriod._toProtobuf(),
            memo: this._topicMemo,
        };
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        const timestamp = /** @type {import("../Timestamp.js").default} */ (
            this._transactionIds.current.validStart
        );
        return `TopicCreateTransaction:${timestamp.toString()}`;
    }
}

TRANSACTION_REGISTRY.set(
    "consensusCreateTopic",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TopicCreateTransaction._fromProtobuf,
);
