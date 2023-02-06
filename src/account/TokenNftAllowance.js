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

import TokenId from "../token/TokenId.js";
import AccountId from "./AccountId.js";
import Long from "long";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IGrantedNftAllowance} HashgraphProto.proto.IGrantedNftAllowance
 * @typedef {import("@hashgraph/proto").proto.INftRemoveAllowance} HashgraphProto.proto.INftRemoveAllowance
 * @typedef {import("@hashgraph/proto").proto.INftAllowance} HashgraphProto.proto.INftAllowance
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HashgraphProto.proto.ITokenID
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HashgraphProto.proto.IAccountID
 */

/**
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

export default class TokenNftAllowance {
    /**
     * @internal
     * @param {object} props
     * @param {TokenId} props.tokenId
     * @param {AccountId | null} props.spenderAccountId
     * @param {AccountId | null} props.ownerAccountId
     * @param {Long[] | null} props.serialNumbers
     * @param {boolean | null} props.allSerials
     * @param {AccountId | null} props.delegatingSpender
     */
    constructor(props) {
        /**
         * The token that the allowance pertains to.
         *
         * @readonly
         */
        this.tokenId = props.tokenId;

        /**
         * The account ID of the spender of the hbar allowance.
         *
         * @readonly
         */
        this.spenderAccountId = props.spenderAccountId;

        /**
         * The account ID of the owner of the hbar allowance.
         *
         * @readonly
         */
        this.ownerAccountId = props.ownerAccountId;

        /**
         * The current balance of the spender's token allowance.
         * **NOTE**: If `null`, the spender has access to all of the account owner's NFT instances
         * (currently owned and any in the future).
         *
         * @readonly
         */
        this.serialNumbers = props.serialNumbers;

        /**
         * @readonly
         */
        this.allSerials = props.allSerials;

        /**
         * The account ID of the spender who is granted approvedForAll allowance and granting
         * approval on an NFT serial to another spender.
         *
         * @readonly
         */
        this.delegatingSpender = props.delegatingSpender;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.INftAllowance} allowance
     * @returns {TokenNftAllowance}
     */
    static _fromProtobuf(allowance) {
        const allSerials =
            allowance.approvedForAll != null &&
            allowance.approvedForAll.value == true;
        return new TokenNftAllowance({
            tokenId: TokenId._fromProtobuf(
                /** @type {HashgraphProto.proto.ITokenID} */ (allowance.tokenId)
            ),
            spenderAccountId:
                allowance.spender != null
                    ? AccountId._fromProtobuf(
                          /** @type {HashgraphProto.proto.IAccountID} */ (
                              allowance.spender
                          )
                      )
                    : null,
            ownerAccountId:
                allowance.owner != null
                    ? AccountId._fromProtobuf(
                          /**@type {HashgraphProto.proto.IAccountID}*/ (
                              allowance.owner
                          )
                      )
                    : null,
            serialNumbers: allSerials
                ? null
                : allowance.serialNumbers != null
                ? allowance.serialNumbers.map((serialNumber) =>
                      Long.fromValue(serialNumber)
                  )
                : [],
            allSerials,
            delegatingSpender:
                allowance.delegatingSpender != null
                    ? AccountId._fromProtobuf(
                          /**@type {HashgraphProto.proto.IAccountID}*/ (
                              allowance.delegatingSpender
                          )
                      )
                    : null,
        });
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IGrantedNftAllowance} allowance
     * @param {AccountId} ownerAccountId
     * @returns {TokenNftAllowance}
     */
    static _fromGrantedProtobuf(allowance, ownerAccountId) {
        return new TokenNftAllowance({
            tokenId: TokenId._fromProtobuf(
                /** @type {HashgraphProto.proto.ITokenID} */ (allowance.tokenId)
            ),
            spenderAccountId: AccountId._fromProtobuf(
                /** @type {HashgraphProto.proto.IAccountID} */ (
                    allowance.spender
                )
            ),
            ownerAccountId,
            serialNumbers: [],
            allSerials: null,
            delegatingSpender: null,
        });
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.INftRemoveAllowance} allowance
     * @returns {TokenNftAllowance}
     */
    static _fromRemoveProtobuf(allowance) {
        return new TokenNftAllowance({
            tokenId: TokenId._fromProtobuf(
                /** @type {HashgraphProto.proto.ITokenID} */ (allowance.tokenId)
            ),
            spenderAccountId: null,
            ownerAccountId:
                allowance.owner != null
                    ? AccountId._fromProtobuf(
                          /**@type {HashgraphProto.proto.IAccountID}*/ (
                              allowance.owner
                          )
                      )
                    : null,
            serialNumbers:
                allowance.serialNumbers != null
                    ? allowance.serialNumbers.map((serialNumber) =>
                          Long.fromValue(serialNumber)
                      )
                    : [],
            allSerials: null,
            delegatingSpender: null,
        });
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.INftAllowance}
     */
    _toProtobuf() {
        return {
            tokenId: this.tokenId._toProtobuf(),
            spender:
                this.spenderAccountId != null
                    ? this.spenderAccountId._toProtobuf()
                    : null,
            owner:
                this.ownerAccountId != null
                    ? this.ownerAccountId._toProtobuf()
                    : null,
            approvedForAll:
                this.serialNumbers == null ? { value: this.allSerials } : null,
            serialNumbers: this.serialNumbers,
            delegatingSpender:
                this.delegatingSpender != null
                    ? this.delegatingSpender._toProtobuf()
                    : null,
        };
    }

    /**
     * @param {Client} client
     */
    _validateChecksums(client) {
        this.tokenId.validateChecksum(client);

        if (this.ownerAccountId != null) {
            this.ownerAccountId.validateChecksum(client);
        }

        if (this.spenderAccountId != null) {
            this.spenderAccountId.validateChecksum(client);
        }
    }
}
