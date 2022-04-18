/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2022 Hedera Hashgraph, LLC
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

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITimestamp} HashgraphProto.proto.ITimestamp
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HashgraphProto.proto.IAccountID
 * @typedef {import("@hashgraph/proto").proto.ICryptoGetAccountBalanceResponse} HashgraphProto.proto.ICryptoGetAccountBalanceResponse
 * @typedef {import("@hashgraph/proto").proto.IKey} HashgraphProto.proto.IKey
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HashgraphProto.proto.ITokenID
 * @typedef {import("@hashgraph/proto").proto.ITokenBalance} HashgraphProto.proto.ITokenBalance
 */

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

        /** @readonly */
        this.tokens = props.tokens;

        /** @readonly */
        this.tokenDecimals = props.tokenDecimals;

        Object.freeze(this);
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
                    )
                );

                tokenDecimals._set(
                    tokenId,
                    balance.decimals != null ? balance.decimals : 0
                );
                tokenBalances._set(
                    tokenId,
                    Long.fromValue(/** @type {Long} */ (balance.balance))
                );
            }
        }

        return new AccountBalance({
            hbars: Hbar.fromTinybars(
                /** @type {Long} */ (accountBalance.balance)
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

        for (const [key, value] of this.tokens != null ? this.tokens : []) {
            list.push({
                tokenId: key._toProtobuf(),
                balance: value,
                decimals:
                    this.tokenDecimals != null
                        ? this.tokenDecimals.get(key)
                        : null,
            });
        }

        return {
            balance: this.hbars.toTinybars(),
            tokenBalances: list,
        };
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
        for (const [key, value] of this.tokens != null ? this.tokens : []) {
            const decimals =
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
