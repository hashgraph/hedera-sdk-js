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
import Transaction from "../transaction/Transaction.js";
import { TRANSACTION_REGISTRY } from "../transaction/Transaction.js";
import TokenReference from "../token/TokenReference.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HashgraphProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HashgraphProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HashgraphProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HashgraphProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HashgraphProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITokenRejectTransactionBody} HashgraphProto.proto.ITokenRejectTransactionBody
 * @typedef {import("@hashgraph/proto").proto.TokenReference} HashgraphProto.proto.TokenReference
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../token/TokenId.js").default} TokenId
 * @typedef {import("../token/NftId.js").default} NftId
 */

/**
 * Reject a new Hedera™ crypto-currency token.
 */
export default class TokenRejectTransaction extends Transaction {
    /**
     *
     * @param {object} [props]
     * @param {?AccountId} [props.owner]
     * @param {NftId[]} [props.nftIds]
     * @param {TokenId[]} [props.tokenIds]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?AccountId}
         */
        this._owner = null;

        if (props.owner != null) {
            this.setOwnerId(props.owner);
        }

        /**
         * @private
         * @type {TokenId[]}
         */
        this._tokenIds = [];

        /**
         * @private
         * @type {NftId[]}
         */
        this._nftIds = [];

        if (props.tokenIds != null) {
            this.setTokenIds(props.tokenIds);
        }

        if (props.nftIds != null) {
            this.setNftIds(props.nftIds);
        }
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ITransaction[]} transactions
     * @param {HashgraphProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HashgraphProto.proto.ITransactionBody[]} bodies
     * @returns {TokenRejectTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies,
    ) {
        const body = bodies[0];
        const rejectToken =
            /** @type {HashgraphProto.proto.ITokenRejectTransactionBody} */ (
                body.tokenReject
            );

        const tokenIds = rejectToken.rejections?.map((rejection) =>
            TokenReference._fromProtobuf(rejection),
        );
        const ftIds = tokenIds
            ?.filter((token) => token.fungibleToken)
            .map(({ fungibleToken }) => {
                if (fungibleToken == null) {
                    throw new Error("Fungible Token cannot be null");
                }
                return fungibleToken;
            });

        const nftIds = tokenIds
            ?.filter((token) => token.nft)
            .map(({ nft }) => {
                if (nft == null) {
                    throw new Error("Nft cannot be null");
                }
                return nft;
            });

        return Transaction._fromProtobufTransactions(
            new TokenRejectTransaction({
                owner:
                    rejectToken.owner != null
                        ? AccountId._fromProtobuf(rejectToken.owner)
                        : undefined,

                tokenIds: ftIds,
                nftIds: nftIds,
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies,
        );
    }

    /**
     * @returns {TokenId[]}
     */
    get tokenIds() {
        return this._tokenIds;
    }

    /**
     * @param {TokenId[]} tokenIds
     * @returns {this}
     */
    setTokenIds(tokenIds) {
        this._requireNotFrozen();
        this._tokenIds = tokenIds;
        return this;
    }

    /**
     * @param {TokenId} tokenId
     * @returns {this}
     */
    addTokenId(tokenId) {
        this._requireNotFrozen();
        this._tokenIds?.push(tokenId);
        return this;
    }

    /**
     * @returns {NftId[]}
     *
     */
    get nftIds() {
        return this._nftIds;
    }

    /**
     *
     * @param {NftId[]} nftIds
     * @returns {this}
     */
    setNftIds(nftIds) {
        this._requireNotFrozen();
        this._nftIds = nftIds;
        return this;
    }

    /**
     * @param {NftId} nftId
     * @returns {this}
     */
    addNftId(nftId) {
        this._requireNotFrozen();
        this._nftIds?.push(nftId);
        return this;
    }

    /**
     * @returns {?AccountId}
     */
    get ownerId() {
        return this._owner;
    }

    /**
     * @param {AccountId} owner
     * @returns {this}
     */
    setOwnerId(owner) {
        this._requireNotFrozen();
        this._owner = owner;
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
        return channel.token.rejectToken(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<HashgraphProto.proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "tokenReject";
    }

    /**
     * @returns {HashgraphProto.proto.ITokenRejectTransactionBody}
     */
    _makeTransactionData() {
        /** @type {HashgraphProto.proto.TokenReference[]} */
        const rejections = [];
        for (const tokenId of this._tokenIds) {
            rejections.push({
                fungibleToken: tokenId._toProtobuf(),
            });
        }

        for (const nftId of this._nftIds) {
            rejections.push({
                nft: nftId._toProtobuf(),
            });
        }
        return {
            owner: this.ownerId?._toProtobuf() ?? null,
            rejections,
        };
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        const timestamp = /** @type {import("../Timestamp.js").default} */ (
            this._transactionIds.current.validStart
        );
        return `TokenRejectTransaction:${timestamp.toString()}`;
    }
}
TRANSACTION_REGISTRY.set(
    "tokenReject",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TokenRejectTransaction._fromProtobuf,
);
