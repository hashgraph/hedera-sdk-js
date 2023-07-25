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

import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import AccountId from "./AccountId.js";
import NftId from "../token/NftId.js";
import TokenNftAllowance from "./TokenNftAllowance.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HashgraphProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HashgraphProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HashgraphProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HashgraphProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HashgraphProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.ICryptoDeleteAllowanceTransactionBody} HashgraphProto.proto.ICryptoDeleteAllowanceTransactionBody
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HashgraphProto.proto.IAccountID
 */

/**
 * @typedef {import("./HbarAllowance.js").default} HbarAllowance
 * @typedef {import("./TokenAllowance.js").default} TokenAllowance
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("../long.js").LongObject} LongObject
 */

/**
 * Change properties for the given account.
 */
export default class AccountAllowanceDeleteTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {HbarAllowance[]} [props.hbarAllowances]
     * @param {TokenAllowance[]} [props.tokenAllowances]
     * @param {TokenNftAllowance[]} [props.nftAllowances]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {TokenNftAllowance[]}
         */
        this._nftAllowances =
            props.nftAllowances != null ? props.nftAllowances : [];
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ITransaction[]} transactions
     * @param {HashgraphProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HashgraphProto.proto.ITransactionBody[]} bodies
     * @returns {AccountAllowanceDeleteTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];
        const allowance =
            /** @type {HashgraphProto.proto.ICryptoDeleteAllowanceTransactionBody} */ (
                body.cryptoDeleteAllowance
            );

        return Transaction._fromProtobufTransactions(
            new AccountAllowanceDeleteTransaction({
                nftAllowances: (allowance.nftAllowances != null
                    ? allowance.nftAllowances
                    : []
                ).map((allowance) =>
                    TokenNftAllowance._fromProtobuf(allowance)
                ),
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies
        );
    }

    /**
     * @returns {TokenNftAllowance[]}
     */
    get tokenNftAllowanceDeletions() {
        return this._nftAllowances;
    }

    /**
     * @description If you want to remove allowance for all serials of a NFT
     *      - use AccountAllowanceApproveTransaction().deleteTokenNftAllowanceAllSerials()
     * @param {NftId | string} nftId
     * @param {AccountId | string} ownerAccountId
     * @returns {AccountAllowanceDeleteTransaction}
     */
    deleteAllTokenNftAllowances(nftId, ownerAccountId) {
        this._requireNotFrozen();

        const id = typeof nftId === "string" ? NftId.fromString(nftId) : nftId;

        const owner =
            typeof ownerAccountId === "string"
                ? AccountId.fromString(ownerAccountId)
                : ownerAccountId;
        let found = false;

        for (const allowance of this._nftAllowances) {
            if (allowance.tokenId.compare(id.tokenId) === 0) {
                if (allowance.serialNumbers != null) {
                    allowance.serialNumbers.push(id.serial);
                }
                found = true;
                break;
            }
        }

        if (!found) {
            this._nftAllowances.push(
                new TokenNftAllowance({
                    tokenId: id.tokenId,
                    spenderAccountId: null,
                    serialNumbers: [id.serial],
                    ownerAccountId: owner,
                    allSerials: false,
                    delegatingSpender: null,
                })
            );
        }

        return this;
    }

    /**
     * @param {Client} client
     */
    _validateChecksums(client) {
        this._nftAllowances.map((allowance) =>
            allowance._validateChecksums(client)
        );
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {HashgraphProto.proto.ITransaction} request
     * @returns {Promise<HashgraphProto.proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.crypto.deleteAllowances(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<HashgraphProto.proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "cryptoDeleteAllowance";
    }

    /**
     * @override
     * @protected
     * @returns {HashgraphProto.proto.ICryptoDeleteAllowanceTransactionBody}
     */
    _makeTransactionData() {
        return {
            nftAllowances: this._nftAllowances.map((allowance) =>
                allowance._toProtobuf()
            ),
        };
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        const timestamp = /** @type {import("../Timestamp.js").default} */ (
            this._transactionIds.current.validStart
        );
        return `AccountAllowanceDeleteTransaction:${timestamp.toString()}`;
    }
}

TRANSACTION_REGISTRY.set(
    "cryptoDeleteAllowance",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    AccountAllowanceDeleteTransaction._fromProtobuf
);
