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
/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenBalance} HashgraphProto.proto.ITokenBalance
 * @typedef {import("@hashgraph/proto").proto.ITokenRelationship} HashgraphProto.proto.ITokenRelationship
 * @typedef {import("@hashgraph/proto").proto.TokenKycStatus} HashgraphProto.proto.TokenKycStatus
 * @typedef {import("@hashgraph/proto").proto.TokenFreezeStatus} HashgraphProto.proto.TokenFreezeStatus
 */
import TokenId from "../token/TokenId.js";
import Long from "long";
import TokenKycStatus from "../token/TokenKycStatus.js";
import TokenFreezeStatus from "../token/TokenFreezeStatus.js";

/**
 * @typedef MirrorNodeTokenResponse
 * @property {boolean} automatic_association
 * @property {number} balance
 * @property {string} created_timestamp
 * @property {number} decimals
 * @property {string} token_id
 * @property {string} freeze_status
 * @property {string} kyc_status
 */

/**
 * @typedef {import("./MirrorNodeGateway.js").default} MirrorNodeGateway
 */

export default class MirrorNodeService {
    /**
     * @param {MirrorNodeGateway} mirrorNodeGateway
     */
    constructor(mirrorNodeGateway) {
        /**
         * @private
         * @type {MirrorNodeGateway}
         */
        this._mirrorNodeGateway = mirrorNodeGateway;

        /**
         * @private
         * @type {number}
         */
        this._timeout = 0;
    }

    /**
     * @param {string} idOrAliasOrEvmAddress
     * @returns {Promise<HashgraphProto.proto.ITokenBalance[]>}
     */
    async getTokenBalancesForAccount(idOrAliasOrEvmAddress) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this._mirrorNodeGateway
                    .getAccountTokens(idOrAliasOrEvmAddress)
                    .then(
                        (
                            /** @type {import("axios").AxiosResponse<{ tokens: MirrorNodeTokenResponse[] }>} */ response,
                        ) => {
                            /** @type {HashgraphProto.proto.ITokenBalance[]} */
                            const tokenBalances = response.data.tokens.map(
                                (
                                    /** @type {MirrorNodeTokenResponse} */ token,
                                ) => ({
                                    tokenId: TokenId.fromString(
                                        token.token_id,
                                    )._toProtobuf(),
                                    balance: Long.fromNumber(token.balance),
                                    decimals: token.decimals,
                                }),
                            );
                            tokenBalances.map((t) => {
                                console.log(t.tokenId, t.balance, t.decimals);
                            });
                            resolve(tokenBalances);
                        },
                    )
                    .catch((error) => {
                        reject(error);
                    });
            }, this._timeout);
        });
    }

    /**
     * @param {string} idOrAliasOrEvmAddress
     * @returns {Promise<HashgraphProto.proto.ITokenRelationship[]>}
     */
    getTokenRelationshipsForAccount(idOrAliasOrEvmAddress) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this._mirrorNodeGateway
                    .getAccountTokens(idOrAliasOrEvmAddress)
                    .then(
                        (
                            /** @type {import("axios").AxiosResponse<{ tokens: MirrorNodeTokenResponse[] }>} */ response,
                        ) => {
                            /** @type {HashgraphProto.proto.ITokenRelationship[]} */
                            const tokenRelationships = response.data.tokens.map(
                                (
                                    /** @type {MirrorNodeTokenResponse} */ token,
                                ) => ({
                                    tokenId: TokenId.fromString(
                                        token.token_id,
                                    )._toProtobuf(),
                                    balance: Long.fromNumber(token.balance),
                                    decimals: token.decimals,
                                    kycStatus: this.getTokenKycStatusFrom(
                                        token.kyc_status,
                                    ),
                                    freezeStatus: this.getTokenFreezeStatusFrom(
                                        token.freeze_status,
                                    ),
                                    automaticAssociation:
                                        token.automatic_association,
                                }),
                            );
                            console.log(tokenRelationships);
                            resolve(tokenRelationships);
                        },
                    )
                    .catch((error) => {
                        reject(error);
                    });
            }, this._timeout);
        });
    }

    /**
     *
     * @param {string} status
     * @returns {HashgraphProto.proto.TokenKycStatus}
     */
    getTokenKycStatusFrom(status) {
        switch (status) {
            case "NOT_APPLICABLE":
                return TokenKycStatus.KycNotApplicable.valueOf();
            case "GRANTED":
                return TokenKycStatus.Granted.valueOf();
            case "REVOKED":
                return TokenKycStatus.Revoked.valueOf();
            default:
                throw new Error(`Invalid token KYC status: ${status}`);
        }
    }

    /**
     *
     * @param {string} status
     * @returns {HashgraphProto.proto.TokenFreezeStatus}
     */
    getTokenFreezeStatusFrom(status) {
        switch (status) {
            case "NOT_APPLICABLE":
                return TokenFreezeStatus.FreezeNotApplicable.valueOf();
            case "FROZEN":
                return TokenFreezeStatus.Frozen.valueOf();
            case "UNFROZEN":
                return TokenFreezeStatus.Unfrozen.valueOf();
            default:
                throw new Error(`Invalid token freeze status: ${status}`);
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
}
