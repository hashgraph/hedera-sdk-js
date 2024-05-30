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
import * as hashgraphProto from "@hashgraph/proto";

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

/**
 * @enum {string}
 */
export const TokenFreezeStatusEnum = {
    NOT_APPLICABLE: "NOT_APPLICABLE",
    FROZEN: "FROZEN",
    UNFROZEN: "UNFROZEN",
};
/**
 * @enum {string}
 */
export const TokenKeyStatusEnum = {
    NOT_APPLICABLE: "NOT_APPLICABLE",
    GRANTED: "GRANTED",
    REVOKED: "REVOKED",
};

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

                            resolve(tokenBalances);
                        },
                    )
                    .catch((error) => reject(error));
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
            case TokenKeyStatusEnum.NOT_APPLICABLE:
                return hashgraphProto.proto.TokenKycStatus.KycNotApplicable;
            case TokenKeyStatusEnum.GRANTED:
                return hashgraphProto.proto.TokenKycStatus.Granted;
            case TokenKeyStatusEnum.REVOKED:
                return hashgraphProto.proto.TokenKycStatus.Revoked;
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
            case TokenFreezeStatusEnum.NOT_APPLICABLE:
                return hashgraphProto.proto.TokenFreezeStatus
                    .FreezeNotApplicable;
            case TokenFreezeStatusEnum.FROZEN:
                return hashgraphProto.proto.TokenFreezeStatus.Frozen;
            case TokenFreezeStatusEnum.UNFROZEN:
                return hashgraphProto.proto.TokenFreezeStatus.Unfrozen;
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
