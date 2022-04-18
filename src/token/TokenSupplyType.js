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

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.TokenSupplyType} HashgraphProto.proto.TokenSupplyType
 */

export default class TokenSupplyType {
    /**
     * @hideconstructor
     * @internal
     * @param {number} code
     */
    constructor(code) {
        /** @readonly */
        this._code = code;

        Object.freeze(this);
    }

    /**
     * @returns {string}
     */
    toString() {
        switch (this) {
            case TokenSupplyType.Infinite:
                return "INFINITE";
            case TokenSupplyType.Finite:
                return "FINITE";
            default:
                return `UNKNOWN (${this._code})`;
        }
    }

    /**
     * @internal
     * @param {number} code
     * @returns {TokenSupplyType}
     */
    static _fromCode(code) {
        switch (code) {
            case 0:
                return TokenSupplyType.Infinite;
            case 1:
                return TokenSupplyType.Finite;
        }

        throw new Error(
            `(BUG) TokenSupplyType.fromCode() does not handle code: ${code}`
        );
    }

    /**
     * @returns {HashgraphProto.proto.TokenSupplyType}
     */
    valueOf() {
        return this._code;
    }
}

/**
 * Interchangeable value with one another, where any quantity of them has the
 * same value as another equal quantity if they are in the same class. Share
 * a single set of properties, not distinct from one another. Simply represented
 * as a balance or quantity to a given Hedera account.
 */
TokenSupplyType.Infinite = new TokenSupplyType(0);

/**
 * Unique, not interchangeable with other tokens of the same type as they
 * typically have different values. Individually traced and can carry unique
 * properties (e.g. serial number).
 */
TokenSupplyType.Finite = new TokenSupplyType(1);
