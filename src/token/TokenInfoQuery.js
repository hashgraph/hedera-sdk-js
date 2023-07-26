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

import Query, { QUERY_REGISTRY } from "../query/Query.js";
import TokenId from "./TokenId.js";
import TokenInfo from "./TokenInfo.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Hbar from "../Hbar.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IQuery} HashgraphProto.proto.IQuery
 * @typedef {import("@hashgraph/proto").proto.IQueryHeader} HashgraphProto.proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").proto.IResponse} HashgraphProto.proto.IResponse
 * @typedef {import("@hashgraph/proto").proto.IResponseHeader} HashgraphProto.proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").proto.ITokenInfo} HashgraphProto.proto.ITokenInfo
 * @typedef {import("@hashgraph/proto").proto.ITokenGetInfoQuery} HashgraphProto.proto.ITokenGetInfoQuery
 * @typedef {import("@hashgraph/proto").proto.ITokenGetInfoResponse} HashgraphProto.proto.ITokenGetInfoResponse
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../account/AccountId.js").default} AccountId
 */

/**
 * @augments {Query<TokenInfo>}
 */
export default class TokenInfoQuery extends Query {
    /**
     * @param {object} properties
     * @param {TokenId | string} [properties.tokenId]
     */
    constructor(properties = {}) {
        super();

        /**
         * @private
         * @type {?TokenId}
         */
        this._tokenId = null;
        if (properties.tokenId != null) {
            this.setTokenId(properties.tokenId);
        }
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IQuery} query
     * @returns {TokenInfoQuery}
     */
    static _fromProtobuf(query) {
        const info = /** @type {HashgraphProto.proto.ITokenGetInfoQuery} */ (
            query.tokenGetInfo
        );

        return new TokenInfoQuery({
            tokenId:
                info.token != null
                    ? TokenId._fromProtobuf(info.token)
                    : undefined,
        });
    }

    /**
     * @returns {?TokenId}
     */
    get tokenId() {
        return this._tokenId;
    }

    /**
     * Set the token ID for which the info is being requested.
     *
     * @param {TokenId | string} tokenId
     * @returns {TokenInfoQuery}
     */
    setTokenId(tokenId) {
        this._tokenId =
            typeof tokenId === "string"
                ? TokenId.fromString(tokenId)
                : tokenId.clone();

        return this;
    }

    /**
     * @override
     * @param {import("../client/Client.js").default<Channel, *>} client
     * @returns {Promise<Hbar>}
     */
    async getCost(client) {
        return super.getCost(client);
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
     * @param {HashgraphProto.proto.IQuery} request
     * @returns {Promise<HashgraphProto.proto.IResponse>}
     */
    _execute(channel, request) {
        return channel.token.getTokenInfo(request);
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {HashgraphProto.proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const tokenGetInfo =
            /** @type {HashgraphProto.proto.ITokenGetInfoResponse} */ (
                response.tokenGetInfo
            );
        return /** @type {HashgraphProto.proto.IResponseHeader} */ (
            tokenGetInfo.header
        );
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IResponse} response
     * @param {AccountId} nodeAccountId
     * @param {HashgraphProto.proto.IQuery} request
     * @returns {Promise<TokenInfo>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapResponse(response, nodeAccountId, request) {
        const info = /** @type {HashgraphProto.proto.ITokenGetInfoResponse} */ (
            response.tokenGetInfo
        );

        return Promise.resolve(
            TokenInfo._fromProtobuf(
                /** @type {HashgraphProto.proto.ITokenInfo} */ (info.tokenInfo)
            )
        );
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IQueryHeader} header
     * @returns {HashgraphProto.proto.IQuery}
     */
    _onMakeRequest(header) {
        return {
            tokenGetInfo: {
                header,
                token:
                    this._tokenId != null ? this._tokenId._toProtobuf() : null,
            },
        };
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        const timestamp =
            this._paymentTransactionId != null &&
            this._paymentTransactionId.validStart != null
                ? this._paymentTransactionId.validStart
                : this._timestamp;

        return `TokenInfoQuery:${timestamp.toString()}`;
    }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("tokenGetInfo", TokenInfoQuery._fromProtobuf);
