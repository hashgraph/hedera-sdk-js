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

import TokenId from "./TokenId.js";
import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import Long from "long";
import * as hex from "../encoding/hex.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HashgraphProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HashgraphProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HashgraphProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HashgraphProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HashgraphProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.ITokenMintTransactionBody} HashgraphProto.proto.ITokenMintTransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HashgraphProto.proto.ITokenID
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * Mint a new Hedera™ crypto-currency token.
 */
export default class TokenMintTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {TokenId | string} [props.tokenId]
     * @param {Long | number} [props.amount]
     * @param {Uint8Array[]} [props.metadata]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?TokenId}
         */
        this._tokenId = null;

        /**
         * @private
         * @type {?Long}
         */
        this._amount = null;

        /**
         * @private
         * @type {Uint8Array[]}
         */
        this._metadata = [];

        if (props.tokenId != null) {
            this.setTokenId(props.tokenId);
        }

        if (props.amount != null) {
            this.setAmount(props.amount);
        }

        if (props.metadata != null) {
            this.setMetadata(props.metadata);
        }
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ITransaction[]} transactions
     * @param {HashgraphProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HashgraphProto.proto.ITransactionBody[]} bodies
     * @returns {TokenMintTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];
        const mintToken =
            /** @type {HashgraphProto.proto.ITokenMintTransactionBody} */ (
                body.tokenMint
            );

        return Transaction._fromProtobufTransactions(
            new TokenMintTransaction({
                tokenId:
                    mintToken.token != null
                        ? TokenId._fromProtobuf(mintToken.token)
                        : undefined,
                amount: mintToken.amount != null ? mintToken.amount : undefined,
                metadata:
                    mintToken.metadata != null ? mintToken.metadata : undefined,
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies
        );
    }

    /**
     * @returns {?TokenId}
     */
    get tokenId() {
        return this._tokenId;
    }

    /**
     * @param {TokenId | string} tokenId
     * @returns {this}
     */
    setTokenId(tokenId) {
        this._requireNotFrozen();
        this._tokenId =
            typeof tokenId === "string"
                ? TokenId.fromString(tokenId)
                : tokenId.clone();

        return this;
    }

    /**
     * @returns {?Long}
     */
    get amount() {
        return this._amount;
    }

    /**
     * @param {Long | number} amount
     * @returns {this}
     */
    setAmount(amount) {
        this._requireNotFrozen();
        this._amount = amount instanceof Long ? amount : Long.fromValue(amount);

        return this;
    }

    /**
     * @param {Client} client
     */
    _validateChecksums(client) {
        if (this._tokenId != null) {
            this._tokenId.validateChecksum(client);
        }
    }

    /**
     * @returns {Uint8Array[]}
     */
    get metadata() {
        return this._metadata;
    }

    /**
     * @param {Uint8Array | string} metadata
     * @returns {this}
     */
    addMetadata(metadata) {
        this._requireNotFrozen();

        if (typeof metadata === "string") {
            console.warn(
                "Passing a `string` for token metadata is considered a bug, and has been removed. Please provide a `Uint8Array` instead."
            );
        }

        this._metadata.push(
            typeof metadata === "string" ? hex.decode(metadata) : metadata
        );

        return this;
    }

    /**
     * @param {Uint8Array[]} metadata
     * @returns {this}
     */
    setMetadata(metadata) {
        this._requireNotFrozen();

        for (const data of metadata) {
            if (typeof data === "string") {
                console.warn(
                    "Passing a `string` for token metadata is considered a bug, and has been removed. Please provide a `Uint8Array` instead."
                );
                break;
            }
        }

        this._metadata = metadata.map((data) =>
            typeof data === "string" ? hex.decode(data) : data
        );

        return this;
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {HashgraphProto.proto.ITransaction} request
     * @returns {Promise<HashgraphProto.proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.token.mintToken(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<HashgraphProto.proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "tokenMint";
    }

    /**
     * @override
     * @protected
     * @returns {HashgraphProto.proto.ITokenMintTransactionBody}
     */
    _makeTransactionData() {
        return {
            amount: this._amount,
            token: this._tokenId != null ? this._tokenId._toProtobuf() : null,
            metadata: this._metadata,
        };
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        const timestamp = /** @type {import("../Timestamp.js").default} */ (
            this._transactionIds.current.validStart
        );
        return `TokenMintTransaction:${timestamp.toString()}`;
    }
}

TRANSACTION_REGISTRY.set(
    "tokenMint",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TokenMintTransaction._fromProtobuf
);
