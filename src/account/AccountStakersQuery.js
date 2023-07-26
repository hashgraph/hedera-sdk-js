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
import AccountId from "./AccountId.js";
import ProxyStaker from "./ProxyStaker.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IQuery} HashgraphProto.proto.IQuery
 * @typedef {import("@hashgraph/proto").proto.IQueryHeader} HashgraphProto.proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").proto.IResponse} HashgraphProto.proto.IResponse
 * @typedef {import("@hashgraph/proto").proto.IResponseHeader} HashgraphProto.proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").proto.ICryptoGetStakersQuery} HashgraphProto.proto.ICryptoGetStakersQuery
 * @typedef {import("@hashgraph/proto").proto.ICryptoGetStakersResponse} HashgraphProto.proto.ICryptoGetStakersResponse
 * @typedef {import("@hashgraph/proto").proto.IAllProxyStakers} HashgraphProto.proto.IAllProxyStakers
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

/**
 * Get all the accounts that are proxy staking to this account.
 * For each of them, give the amount currently staked.
 *
 * This is not yet implemented, but will be in a future version of the API.
 *
 * @augments {Query<ProxyStaker[]>}
 */
export default class AccountStakersQuery extends Query {
    /**
     * @param {object} [props]
     * @param {(AccountId | string)=} props.accountId
     */
    constructor(props = {}) {
        super();

        /**
         * @type {?AccountId}
         * @private
         */
        this._accountId = null;

        if (props.accountId != null) {
            this.setAccountId(props.accountId);
        }
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IQuery} query
     * @returns {AccountStakersQuery}
     */
    static _fromProtobuf(query) {
        const stakers =
            /** @type {HashgraphProto.proto.ICryptoGetStakersQuery} */ (
                query.cryptoGetProxyStakers
            );

        return new AccountStakersQuery({
            accountId:
                stakers.accountID != null
                    ? AccountId._fromProtobuf(stakers.accountID)
                    : undefined,
        });
    }

    /**
     * @returns {?AccountId}
     */
    get accountId() {
        return this._accountId;
    }

    /**
     * Set the account ID for which the stakers are being requested.
     *
     * @param {AccountId | string} accountId
     * @returns {this}
     */
    setAccountId(accountId) {
        this._accountId =
            typeof accountId === "string"
                ? AccountId.fromString(accountId)
                : accountId.clone();

        return this;
    }

    /**
     * @param {Client} client
     */
    _validateChecksums(client) {
        if (this._accountId != null) {
            this._accountId.validateChecksum(client);
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
        return channel.crypto.getStakersByAccountID(request);
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {HashgraphProto.proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const cryptoGetProxyStakers =
            /** @type {HashgraphProto.proto.ICryptoGetStakersResponse} */ (
                response.cryptoGetProxyStakers
            );
        return /** @type {HashgraphProto.proto.IResponseHeader} */ (
            cryptoGetProxyStakers.header
        );
    }

    /**
     * @protected
     * @override
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {Promise<ProxyStaker[]>}
     */
    _mapResponse(response) {
        const cryptoGetProxyStakers =
            /** @type {HashgraphProto.proto.ICryptoGetStakersResponse} */ (
                response.cryptoGetProxyStakers
            );
        const stakers = /** @type {HashgraphProto.proto.IAllProxyStakers} */ (
            cryptoGetProxyStakers.stakers
        );

        return Promise.resolve(
            (stakers.proxyStaker != null ? stakers.proxyStaker : []).map(
                (staker) => ProxyStaker._fromProtobuf(staker)
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
            cryptoGetProxyStakers: {
                header,
                accountID:
                    this._accountId != null
                        ? this._accountId._toProtobuf()
                        : null,
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

        return `AccountStakersQuery:${timestamp.toString()}`;
    }
}

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("cryptoGetProxyStakers", AccountStakersQuery._fromProtobuf);
