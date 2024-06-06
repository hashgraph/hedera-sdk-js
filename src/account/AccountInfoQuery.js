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
import AccountInfo from "./AccountInfo.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Hbar from "../Hbar.js";
import MirrorNodeService from "../network/MirrorNodeService.js";
import MirrorNodeGateway from "../network/MirrorNodeGateway.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IQuery} HashgraphProto.proto.IQuery
 * @typedef {import("@hashgraph/proto").proto.IQueryHeader} HashgraphProto.proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").proto.IResponse} HashgraphProto.proto.IResponse
 * @typedef {import("@hashgraph/proto").proto.IResponseHeader} HashgraphProto.proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").proto.CryptoGetInfoResponse.IAccountInfo} HashgraphProto.proto.CryptoGetInfoResponse.IAccountInfo
 * @typedef {import("@hashgraph/proto").proto.ICryptoGetInfoQuery} HashgraphProto.proto.ICryptoGetInfoQuery
 * @typedef {import("@hashgraph/proto").proto.ICryptoGetInfoResponse} HashgraphProto.proto.ICryptoGetInfoResponse
 * @typedef {import("@hashgraph/proto").proto.ITokenRelationship} HashgraphProto.proto.ITokenRelationship
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../account/TokenRelationship.js").default} TokenRelationship
 */

/**
 * @augments {Query<AccountInfo>}
 */
export default class AccountInfoQuery extends Query {
    /**
     * @param {object} props
     * @param {AccountId | string} [props.accountId]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?AccountId}
         */
        this._accountId = null;

        if (props.accountId != null) {
            this.setAccountId(props.accountId);
        }

        /**
         * @private
         * @description Delay in ms if is necessary to wait for the mirror node to update the account info
         * @type {number}
         */
        this._timeout = 0;
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IQuery} query
     * @returns {AccountInfoQuery}
     */
    static _fromProtobuf(query) {
        const info = /** @type {HashgraphProto.proto.ICryptoGetInfoQuery} */ (
            query.cryptoGetInfo
        );

        return new AccountInfoQuery({
            accountId:
                info.accountID != null
                    ? AccountId._fromProtobuf(info.accountID)
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
     * Set the account ID for which the info is being requested.
     *
     * @param {AccountId | string} accountId
     * @returns {AccountInfoQuery}
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
     *
     * @param {number} timeout
     * @returns {this}
     */
    setTimeout(timeout) {
        this._timeout = timeout;
        return this;
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {HashgraphProto.proto.IQuery} request
     * @returns {Promise<HashgraphProto.proto.IResponse>}
     */
    _execute(channel, request) {
        return channel.crypto.getAccountInfo(request);
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
     * @override
     * @internal
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {HashgraphProto.proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const cryptoGetInfo =
            /** @type {HashgraphProto.proto.ICryptoGetInfoResponse} */ (
                response.cryptoGetInfo
            );
        return /** @type {HashgraphProto.proto.IResponseHeader} */ (
            cryptoGetInfo.header
        );
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IResponse} response
     * @param {AccountId} nodeAccountId
     * @param {HashgraphProto.proto.IQuery} request
     * @returns {Promise<AccountInfo>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapResponse(response, nodeAccountId, request) {
        return new Promise((resolve, reject) => {
            const mirrorNodeGateway = MirrorNodeGateway.forNetwork(
                this._mirrorNetworkNodes,
                this._ledgerId,
            );

            const mirrorNodeService = new MirrorNodeService(mirrorNodeGateway);

            const accountInfoFromConsensusNode =
                /** @type {HashgraphProto.proto.ICryptoGetInfoResponse} */ (
                    response.cryptoGetInfo
                );

            if (
                accountInfoFromConsensusNode.accountInfo &&
                accountInfoFromConsensusNode.accountInfo.accountID
            ) {
                const accountIdFromConsensusNode = AccountId._fromProtobuf(
                    accountInfoFromConsensusNode.accountInfo.accountID,
                );

                mirrorNodeService
                    .setTimeout(this._timeout)
                    .getTokenRelationshipsForAccount(
                        accountIdFromConsensusNode.num.toString(),
                    )
                    .then((tokensRelationships) => {
                        if (
                            accountInfoFromConsensusNode.accountInfo
                                ?.tokenRelationships &&
                            tokensRelationships
                        ) {
                            // Reset the array to avoid duplicates
                            accountInfoFromConsensusNode.accountInfo.tokenRelationships.length = 0;

                            // Add the token relationships from the mirror node to the response from the consensus node
                            accountInfoFromConsensusNode.accountInfo.tokenRelationships.push(
                                ...tokensRelationships,
                            );
                        }

                        resolve(
                            AccountInfo._fromProtobuf(
                                /** @type {HashgraphProto.proto.CryptoGetInfoResponse.IAccountInfo} */ (
                                    accountInfoFromConsensusNode.accountInfo
                                ),
                            ),
                        );
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IQueryHeader} header
     * @returns {HashgraphProto.proto.IQuery}
     */
    _onMakeRequest(header) {
        return {
            cryptoGetInfo: {
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
        return `AccountInfoQuery:${timestamp.toString()}`;
    }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("cryptoGetInfo", AccountInfoQuery._fromProtobuf);
