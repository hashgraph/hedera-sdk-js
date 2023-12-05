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

import Long from "long";
import Hbar from "../Hbar.js";
import TokenId from "../token/TokenId.js";
import TokenBalanceMap from "./TokenBalanceMap.js";
import TokenDecimalMap from "./TokenDecimalMap.js";
import * as HashgraphProto from "@hashgraph/proto";

/**
 * @typedef {object} TokenBalanceJson
 * @property {string} tokenId
 * @property {string} balance
 * @property {number} decimals
 */

/**
 * @typedef {object} AccountBalanceJson
 * @property {string} hbars
 * @property {TokenBalanceJson[]} tokens
 */

export default class AccountBalance {
    /**
     * @private
     * @param {object} props
     * @param {Hbar} props.hbars
     * @param {?TokenBalanceMap} props.tokens
     * @param {?TokenDecimalMap} props.tokenDecimals
     */
    constructor(props) {
        /**
         * The account ID for which this balancermation applies.
         *
         * @readonly
         */
        this.hbars = props.hbars;

        /**
         * @deprecated - Use the mirror node API https://docs.hedera.com/guides/docs/mirror-node-api/rest-api#api-v1-accounts instead
         * @readonly
         */
        // eslint-disable-next-line deprecation/deprecation
        this.tokens = props.tokens;

        /**
         * @deprecated - Use the mirror node API https://docs.hedera.com/guides/docs/mirror-node-api/rest-api#api-v1-accounts instead
         * @readonly
         */
        // eslint-disable-next-line deprecation/deprecation
        this.tokenDecimals = props.tokenDecimals;

        Object.freeze(this);
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {AccountBalance}
     */
    static fromBytes(bytes) {
        return AccountBalance._fromProtobuf(
            HashgraphProto.proto.CryptoGetAccountBalanceResponse.decode(bytes),
        );
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ICryptoGetAccountBalanceResponse} accountBalance
     * @returns {AccountBalance}
     */
    static _fromProtobuf(accountBalance) {
        const tokenBalances = new TokenBalanceMap();
        const tokenDecimals = new TokenDecimalMap();

        if (accountBalance.tokenBalances != null) {
            for (const balance of accountBalance.tokenBalances) {
                const tokenId = TokenId._fromProtobuf(
                    /** @type {HashgraphProto.proto.ITokenID} */ (
                        balance.tokenId
                    ),
                );

                tokenDecimals._set(
                    tokenId,
                    balance.decimals != null ? balance.decimals : 0,
                );
                tokenBalances._set(
                    tokenId,
                    Long.fromValue(/** @type {Long} */ (balance.balance)),
                );
            }
        }

        return new AccountBalance({
            hbars: Hbar.fromTinybars(
                /** @type {Long} */ (accountBalance.balance),
            ),
            tokens: tokenBalances,
            tokenDecimals,
        });
    }

    /**
     * @returns {HashgraphProto.proto.ICryptoGetAccountBalanceResponse}
     */
    _toProtobuf() {
        /** @type {HashgraphProto.proto.ITokenBalance[]} */
        const list = [];

        // eslint-disable-next-line deprecation/deprecation
        for (const [key, value] of this.tokens != null ? this.tokens : []) {
            list.push({
                tokenId: key._toProtobuf(),
                balance: value,
                decimals:
                    // eslint-disable-next-line deprecation/deprecation
                    this.tokenDecimals != null
                        ? // eslint-disable-next-line deprecation/deprecation
                          this.tokenDecimals.get(key)
                        : null,
            });
        }

        return {
            balance: this.hbars.toTinybars(),
            tokenBalances: list,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.CryptoGetAccountBalanceResponse.encode(
            this._toProtobuf(),
        ).finish();
    }

    /**
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * @returns {AccountBalanceJson}
     */
    toJSON() {
        const tokens = [];
        // eslint-disable-next-line deprecation/deprecation
        for (const [key, value] of this.tokens != null ? this.tokens : []) {
            const decimals =
                // eslint-disable-next-line deprecation/deprecation
                this.tokenDecimals != null ? this.tokenDecimals.get(key) : null;

            tokens.push({
                tokenId: key.toString(),
                balance: value.toString(),
                decimals: decimals != null ? decimals : 0,
            });
        }

        return {
            hbars: this.hbars.toString(),
            tokens,
        };
    }
}
