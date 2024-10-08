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
 * @typedef {import("@hashgraph/proto").proto.TokenKeyValidation} HashgraphProto.proto.TokenKeyValidation
 */

/** Types of validation strategies for token keys. */
export default class TokenKeyValidation {
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
            case TokenKeyValidation.FullValidation:
                return "FULL_VALIDATION";
            case TokenKeyValidation.NoValidation:
                return "NO_VALIDATION";
            default:
                return `UNKNOWN (${this._code})`;
        }
    }

    /**
     * @internal
     * @param {number} code
     * @returns {TokenKeyValidation}
     */
    static _fromCode(code) {
        switch (code) {
            case 0:
                return TokenKeyValidation.FullValidation;
            case 1:
                return TokenKeyValidation.NoValidation;
        }

        throw new Error(
            `(BUG) TokenKeyValidation.fromCode() does not handle code: ${code}`,
        );
    }

    /**
     * @returns {HashgraphProto.proto.TokenKeyValidation}
     */
    valueOf() {
        return this._code;
    }
}

/**
 * Currently the default behaviour. It will perform all token key validations.
 */
TokenKeyValidation.FullValidation = new TokenKeyValidation(0);

/**
 * Perform no validations at all for all passed token keys.
 */
TokenKeyValidation.NoValidation = new TokenKeyValidation(1);
