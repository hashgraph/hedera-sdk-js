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

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HashgraphProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HashgraphProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HashgraphProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HashgraphProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HashgraphProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.ITokenUpdateNftsTransactionBody} HashgraphProto.proto.ITokenUpdateNftsTransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HashgraphProto.proto.ITokenID
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../account/AccountId.js").default} AccountId
 */

/**
 * @deprecated - Use TokenUpdateNftsTransaction instead
 */
export default class TokenNftsUpdateTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {TokenId | string} [props.tokenId]
     * @param {Long[]} [props.serialNumbers]
     * @param {Uint8Array} [props.metadata]
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
         * @type {?Long[]}
         */
        this._serialNumbers = [];

        /**
         * @private
         * @type {?Uint8Array}
         */
        this._metadata = null;

        if (props.tokenId != null) {
            this.setTokenId(props.tokenId);
        }

        if (props.serialNumbers != null) {
            this.setSerialNumbers(props.serialNumbers);
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
     * @returns {TokenNftsUpdateTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies,
    ) {
        const body = bodies[0];
        const tokenUpdate =
            /** @type {HashgraphProto.proto.ITokenUpdateNftsTransactionBody} */ (
                body.tokenUpdate
            );

        return Transaction._fromProtobufTransactions(
            // eslint-disable-next-line deprecation/deprecation
            new TokenNftsUpdateTransaction({
                tokenId:
                    tokenUpdate.token != null
                        ? TokenId._fromProtobuf(tokenUpdate.token)
                        : undefined,
                serialNumbers:
                    tokenUpdate.serialNumbers != null
                        ? tokenUpdate.serialNumbers
                        : [],
                metadata:
                    tokenUpdate.metadata != null
                        ? tokenUpdate.metadata.value != null
                            ? tokenUpdate.metadata.value
                            : undefined
                        : undefined,
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies,
        );
    }

    /**
     * @description Assign the token id.
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
     * @description Assign the list of serial numbers.
     * @param {Long[]} serialNumbers
     * @returns {this}
     */
    setSerialNumbers(serialNumbers) {
        this._requireNotFrozen();
        this._serialNumbers = serialNumbers;

        return this;
    }

    /**
     * @param {Uint8Array} metadata
     * @returns {this}
     */
    setMetadata(metadata) {
        this._requireNotFrozen();
        this._metadata = metadata;

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
     * @override
     * @internal
     * @param {Channel} channel
     * @param {HashgraphProto.proto.ITransaction} request
     * @returns {Promise<HashgraphProto.proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.token.pauseToken(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<HashgraphProto.proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "tokenUpdateNfts";
    }

    /**
     * @override
     * @protected
     * @returns {HashgraphProto.proto.ITokenUpdateNftsTransactionBody}
     */
    _makeTransactionData() {
        return {
            token: this._tokenId != null ? this._tokenId._toProtobuf() : null,
            serialNumbers:
                this._serialNumbers != null ? this._serialNumbers : [],
            ...(this._metadata != null
                ? {
                      metadata: {
                          value: this._metadata,
                      },
                  }
                : null),
        };
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        const timestamp = /** @type {import("../Timestamp.js").default} */ (
            this._transactionIds.current.validStart
        );
        return `TokenNftsUpdateTransaction:${timestamp.toString()}`;
    }
}

TRANSACTION_REGISTRY.set(
    "tokenUpdateNfts",
    // eslint-disable-next-line deprecation/deprecation, @typescript-eslint/unbound-method
    TokenNftsUpdateTransaction._fromProtobuf,
);
