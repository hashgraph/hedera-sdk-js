/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2022 Hedera Hashgraph, LLC
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

/**
 * @namespace hashgraphproto
 */

// import Hbar from "./Hbar.js";
// import FileId from "./file/FileId.js";
import Transaction, {
    TRANSACTION_REGISTRY,
} from "./transaction/Transaction.js";
import { isNumber } from "./util.js";

/**
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HashgraphProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.Transaction} HashgraphProto.proto.Transaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HashgraphProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.SignedTransaction} HashgraphProto.proto.SignedTransaction
 * @typedef {import("@hashgraph/proto").proto.IRandomGenerateTransactionBody} HashgraphProto.proto.IRandomGenerateTransactionBody
 * @typedef {import("@hashgraph/proto").proto.RandomGenerateTransactionBody} HashgraphProto.proto.RandomGenerateTransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HashgraphProto.proto.TransactionResponse
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HashgraphProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HashgraphProto.proto.ITransactionBody
 * @typedef {import("./account/AccountId.js").default} AccountId
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 */

/**
 * @typedef {import("./client/Client.js").default<*, *>} Client
 *  @typedef {import("./channel/Channel.js").default} Channel
 */

/**
 * Gets a pseudorandom 32-bit number. Not cryptographically secure. See HIP-351 https://hips.hedera.com/hip/hip-351
 */
export default class RNGTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {?number } [props.range]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?number}
         */
        this._range = null;

        if (props.range != null) {
            this.setRange(props.range);
        }
    }

    /**
     * @param {number} newRange
     */
    setRange(newRange) {
        this._range = newRange;
    }

    get range() {
        return this._range;
    }

    /**
     * @param {Client} client
     */
    _validateChecksums(client) {
        if (this._range != null && isNumber(this._range)) {
            this._validateChecksums(client);
        }
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {HashgraphProto.proto.ITransaction} request
     * @returns {Promise<HashgraphProto.proto.TransactionResponse>}
     */
    _execute(channel, request) {
        return channel.util.randomGenerate(request);
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ITransaction[]} transactions
     * @param {HashgraphProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HashgraphProto.proto.ITransactionBody[]} bodies
     * @returns {RNGTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body =
            /** @type {HashgraphProto.proto.RandomGenerateTransactionBody} */ (
                bodies[0]
            );

        const transactionRange = body.range;

        return Transaction._fromProtobufTransactions(
            new RNGTransaction({
                range: transactionRange,
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies
        );
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<HashgraphProto.proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "randomGenerate";
    }

    /**
     * @override
     * @protected
     * @returns {HashgraphProto.proto.IRandomGenerateTransactionBody}
     */
    _makeTransactionData() {
        return {
            range: this.range,
        };
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        const timestamp = /** @type {import("./Timestamp.js").default} */ (
            this._transactionIds.current.validStart
        );
        return `RandomGenerate:${timestamp.toString()}`;
    }
}

TRANSACTION_REGISTRY.set(
    "randomGenerate",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    RNGTransaction._fromProtobuf
);
