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

import AccountId from "../account/AccountId.js";
import TokenId from "../token/TokenId.js";
import Hbar from "../Hbar.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenAssociation} HashgraphProto.proto.ITokenAssociation
 */

export default class TokenAssociation {
    /**
     * @param {object} props
     * @param {AccountId | string} [props.accountId]
     * @param {TokenId | string} [props.tokenId]
     */
    constructor(props = {}) {
        /**
         * @type {?AccountId}
         */
        this._accountId = null;

        if (props.accountId != null) {
            this.setAccountId(props.accountId);
        }

        /**
         * @type {?TokenId}
         */
        this._tokenId = null;

        if (props.tokenId != null) {
            this.setTokenId(props.tokenId);
        }

        this._defaultMaxTransactionFee = new Hbar(5);
    }

    /**
     * @returns {?AccountId}
     */
    get accountId() {
        return this._accountId;
    }

    /**
     * @param {AccountId | string} accountId
     * @returns {this}
     */
    setAccountId(accountId) {
        this._accountId =
            typeof accountId === "string"
                ? AccountId.fromString(accountId)
                : accountId;
        return this;
    }

    /**
     * @returns {?TokenId}
     */
    get tokenId() {
        return this._tokenId;
    }

    /**
     * @param {TokenId | string} tokenId
     * @returns {this}
     */
    setTokenId(tokenId) {
        this._tokenId =
            typeof tokenId === "string" ? TokenId.fromString(tokenId) : tokenId;
        return this;
    }

    /**
     * @internal
     * @abstract
     * @param {HashgraphProto.proto.ITokenAssociation} association
     * @returns {TokenAssociation}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static _fromProtobuf(association) {
        return new TokenAssociation({
            accountId:
                association.accountId != null
                    ? AccountId._fromProtobuf(association.accountId)
                    : undefined,
            tokenId:
                association.tokenId != null
                    ? TokenId._fromProtobuf(association.tokenId)
                    : undefined,
        });
    }

    /**
     * @internal
     * @abstract
     * @returns {HashgraphProto.proto.ITokenAssociation}
     */
    _toProtobuf() {
        return {
            accountId:
                this._accountId != null
                    ? this._accountId._toProtobuf()
                    : undefined,
            tokenId:
                this._tokenId != null ? this._tokenId._toProtobuf() : undefined,
        };
    }
}
