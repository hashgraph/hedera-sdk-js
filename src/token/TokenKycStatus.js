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
 * @typedef {import("@hashgraph/proto").proto.TokenKycStatus} HashgraphProto.proto.TokenKycStatus
 */

export default class TokenKycStatus {
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
            case TokenKycStatus.KycNotApplicable:
                return "NOT_APPLICABLE";
            case TokenKycStatus.Granted:
                return "GRANTED";
            case TokenKycStatus.Revoked:
                return "REVOKED";
            default:
                return `UNKNOWN (${this._code})`;
        }
    }

    /**
     * @internal
     * @param {number} code
     * @returns {TokenKycStatus}
     */
    static _fromCode(code) {
        switch (code) {
            case 0:
                return TokenKycStatus.KycNotApplicable;
            case 1:
                return TokenKycStatus.Granted;
            case 2:
                return TokenKycStatus.Revoked;
        }

        throw new Error(
            `(BUG) TokenKycStatus.fromCode() does not handle code: ${code}`,
        );
    }

    /**
     * @returns {HashgraphProto.proto.TokenKycStatus}
     */
    valueOf() {
        return this._code;
    }
}

TokenKycStatus.KycNotApplicable = new TokenKycStatus(0);

TokenKycStatus.Granted = new TokenKycStatus(1);

TokenKycStatus.Revoked = new TokenKycStatus(2);
