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

import Transaction, {
    TRANSACTION_REGISTRY,
} from "./transaction/Transaction.js";
import { isNumber } from "./util.js";

/**
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HashgraphProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.Transaction} HashgraphProto.proto.Transaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HashgraphProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.SignedTransaction} HashgraphProto.proto.SignedTransaction
 * @typedef {import("@hashgraph/proto").proto.IUtilPrngTransactionBody } HashgraphProto.proto.IUtilPrngTransactionBody
 * @typedef {import("@hashgraph/proto").proto.UtilPrngTransactionBody} HashgraphProto.proto.UtilPrngTransactionBody
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
export default class PrngTransaction extends Transaction {
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
     * @returns {this}
     */
    setRange(newRange) {
        this._range = newRange;
        return this;
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
        return channel.util.prng(request);
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ITransaction[]} transactions
     * @param {HashgraphProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HashgraphProto.proto.ITransactionBody[]} bodies
     * @returns {PrngTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body =
            /** @type {HashgraphProto.proto.UtilPrngTransactionBody} */ (
                bodies[0]
            );

        const transactionRange = body.range;

        return Transaction._fromProtobufTransactions(
            new PrngTransaction({
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
        return "utilPrng";
    }

    /**
     * @override
     * @protected
     * @returns {HashgraphProto.proto.IUtilPrngTransactionBody}
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
    "utilPrng",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    PrngTransaction._fromProtobuf
);
