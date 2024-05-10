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
 * @typedef {import("@hashgraph/proto").proto.TokenFreezeStatus} HashgraphProto.proto.TokenFreezeStatus
 */

export default class TokenFreezeStatus {
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
            case TokenFreezeStatus.FreezeNotApplicable:
                return "NOT_APPLICABLE";
            case TokenFreezeStatus.Frozen:
                return "GRANTED";
            case TokenFreezeStatus.Unfrozen:
                return "REVOKED";
            default:
                return `UNKNOWN (${this._code})`;
        }
    }

    /**
     * @internal
     * @param {number} code
     * @returns {TokenFreezeStatus}
     */
    static _fromCode(code) {
        switch (code) {
            case 0:
                return TokenFreezeStatus.FreezeNotApplicable;
            case 1:
                return TokenFreezeStatus.Frozen;
            case 2:
                return TokenFreezeStatus.Unfrozen;
        }

        throw new Error(
            `(BUG) TokenFreezeStatus.fromCode() does not handle code: ${code}`,
        );
    }

    /**
     * @returns {HashgraphProto.proto.TokenFreezeStatus}
     */
    valueOf() {
        return this._code;
    }
}

TokenFreezeStatus.FreezeNotApplicable = new TokenFreezeStatus(0);

TokenFreezeStatus.Frozen = new TokenFreezeStatus(1);

TokenFreezeStatus.Unfrozen = new TokenFreezeStatus(2);
