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
import ContractId from "../contract/ContractId.js";
import AccountBalance from "./AccountBalance.js";
import MirrorNodeService from "../network/MirrorNodeService.js";
import MirrorNodeGateway from "../network/MirrorNodeGateway.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IQuery} HashgraphProto.proto.IQuery
 * @typedef {import("@hashgraph/proto").proto.IQueryHeader} HashgraphProto.proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").proto.IResponse} HashgraphProto.proto.IResponse
 * @typedef {import("@hashgraph/proto").proto.IResponseHeader} HashgraphProto.proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").proto.ICryptoGetAccountBalanceQuery} HashgraphProto.proto.ICryptoGetAccountBalanceQuery
 * @typedef {import("@hashgraph/proto").proto.ICryptoGetAccountBalanceResponse} HashgraphProto.proto.ICryptoGetAccountBalanceResponse
 * @typedef {import("@hashgraph/proto").proto.ITokenBalance} HashgraphProto.proto.ITokenBalance
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

/**
 * Get the balance of a Hedera™ crypto-currency account.
 *
 * This returns only the balance, so its a smaller and faster reply
 * than AccountInfoQuery.
 *
 * This query is free.
 *
 * @augments {Query<AccountBalance>}
 */
export default class AccountBalanceQuery extends Query {
    /**
     * @param {object} [props]
     * @param {AccountId | string} [props.accountId]
     * @param {ContractId | string} [props.contractId]
     */
    constructor(props = {}) {
        super();

        /**
         * @type {?AccountId}
         * @private
         */
        this._accountId = null;

        /**
         * @type {?ContractId}
         * @private
         */
        this._contractId = null;

        /**
         * @private
         * @description Delay in ms if is necessary to wait for the mirror node to update the account balance
         * @type {number}
         */
        this._timeout = 0;

        if (props.accountId != null) {
            this.setAccountId(props.accountId);
        }

        if (props.contractId != null) {
            this.setContractId(props.contractId);
        }
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IQuery} query
     * @returns {AccountBalanceQuery}
     */
    static _fromProtobuf(query) {
        const balance =
            /** @type {HashgraphProto.proto.ICryptoGetAccountBalanceQuery} */ (
                query.cryptogetAccountBalance
            );

        return new AccountBalanceQuery({
            accountId:
                balance.accountID != null
                    ? AccountId._fromProtobuf(balance.accountID)
                    : undefined,
            contractId:
                balance.contractID != null
                    ? ContractId._fromProtobuf(balance.contractID)
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
     * Set the account ID for which the balance is being requested.
     *
     * This is mutually exclusive with `setContractId`.
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
     * @returns {?ContractId}
     */
    get contractId() {
        return this._contractId;
    }

    /**
     * Set the contract ID for which the balance is being requested.
     *
     * This is mutually exclusive with `setAccountId`.
     *
     * @param {ContractId | string} contractId
     * @returns {this}
     */
    setContractId(contractId) {
        this._contractId =
            typeof contractId === "string"
                ? ContractId.fromString(contractId)
                : contractId.clone();

        return this;
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
     * @protected
     * @override
     * @returns {boolean}
     */
    _isPaymentRequired() {
        return false;
    }

    /**
     * @param {Client} client
     */
    _validateChecksums(client) {
        if (this._accountId != null) {
            this._accountId.validateChecksum(client);
        }

        if (this._contractId != null) {
            this._contractId.validateChecksum(client);
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
        return channel.crypto.cryptoGetBalance(request);
    }

    /**
     * @override
     * @override
     * @internal
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {HashgraphProto.proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const cryptogetAccountBalance =
            /** @type {HashgraphProto.proto.ICryptoGetAccountBalanceResponse} */ (
                response.cryptogetAccountBalance
            );
        return /** @type {HashgraphProto.proto.IResponseHeader} */ (
            cryptogetAccountBalance.header
        );
    }

    /**
     * @override
     * @override
     * @internal
     * @param {HashgraphProto.proto.IResponse} response
     * @param {AccountId} nodeAccountId
     * @param {HashgraphProto.proto.IQuery} request
     * @returns {Promise<AccountBalance>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapResponse(response, nodeAccountId, request) {
        return new Promise((resolve, reject) => {
            const mirrorNodeGateway = MirrorNodeGateway.forNetwork(
                this._mirrorNetwork,
                this._ledgerId,
            );
            const mirrorNodeService = new MirrorNodeService(mirrorNodeGateway);

            const cryptogetAccountBalanceFromConsensusNode =
                /** @type {HashgraphProto.proto.ICryptoGetAccountBalanceResponse} */ (
                    response.cryptogetAccountBalance
                );

            if (cryptogetAccountBalanceFromConsensusNode.accountID) {
                const accountIdFromConsensusNode = AccountId._fromProtobuf(
                    cryptogetAccountBalanceFromConsensusNode.accountID,
                );

                mirrorNodeService
                    .setTimeout(this._timeout)
                    .getTokenBalancesForAccount(
                        accountIdFromConsensusNode.num.toString(),
                    )
                    .then(
                        (
                            /** @type {HashgraphProto.proto.ITokenBalance[]} */ tokenBalances,
                        ) => {
                            if (
                                cryptogetAccountBalanceFromConsensusNode?.tokenBalances &&
                                tokenBalances
                            ) {
                                // Reset the array to avoid duplicates
                                cryptogetAccountBalanceFromConsensusNode.tokenBalances.length = 0;
                                // Add the token balances from the mirror node to the response fromn the consensus node
                                cryptogetAccountBalanceFromConsensusNode.tokenBalances.push(
                                    ...tokenBalances,
                                );

                                resolve(
                                    AccountBalance._fromProtobuf(
                                        cryptogetAccountBalanceFromConsensusNode,
                                    ),
                                );
                            }
                        },
                    )
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
            cryptogetAccountBalance: {
                header,
                accountID:
                    this._accountId != null
                        ? this._accountId._toProtobuf()
                        : null,
                contractID:
                    this._contractId != null
                        ? this._contractId._toProtobuf()
                        : null,
            },
        };
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        return `AccountBalanceQuery:${this._timestamp.toString()}`;
    }
}

QUERY_REGISTRY.set(
    "cryptogetAccountBalance",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    AccountBalanceQuery._fromProtobuf,
);
