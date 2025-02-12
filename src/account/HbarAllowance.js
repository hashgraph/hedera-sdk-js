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

import AccountId from "./AccountId.js";
import Hbar from "../Hbar.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IGrantedCryptoAllowance} HashgraphProto.proto.IGrantedCryptoAllowance
 * @typedef {import("@hashgraph/proto").proto.ICryptoAllowance} HashgraphProto.proto.ICryptoAllowance
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HashgraphProto.proto.IAccountID
 */

/**
 * @typedef {import("long")} Long
 */

/**
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

/**
 * Represents an HBAR allowance granted to a spender account by an owner account.
 * This class manages the permissions for one account to spend HBAR on behalf of another account.
 */
export default class HbarAllowance {
    /**
     * @internal
     * @param {object} props
     * @param {AccountId | null} props.spenderAccountId
     * @param {AccountId | null} props.ownerAccountId
     * @param {Hbar | null} props.amount
     */
    constructor(props) {
        /**
         * The account ID of the hbar allowance spender.
         *
         * @readonly
         */
        this.spenderAccountId = props.spenderAccountId;

        /**
         * The account ID of the hbar allowance owner.
         *
         * @readonly
         */
        this.ownerAccountId = props.ownerAccountId;

        /**
         * The current balance of the spender's allowance in tinybars.
         *
         * @readonly
         */
        this.amount = props.amount;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ICryptoAllowance} allowance
     * @returns {HbarAllowance}
     */
    static _fromProtobuf(allowance) {
        return new HbarAllowance({
            spenderAccountId: AccountId._fromProtobuf(
                /** @type {HashgraphProto.proto.IAccountID} */ (
                    allowance.spender
                ),
            ),
            ownerAccountId:
                allowance.owner != null
                    ? AccountId._fromProtobuf(
                          /**@type {HashgraphProto.proto.IAccountID}*/ (
                              allowance.owner
                          ),
                      )
                    : null,
            amount: Hbar.fromTinybars(
                allowance.amount != null ? allowance.amount : 0,
            ),
        });
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IGrantedCryptoAllowance} allowance
     * @param {AccountId} ownerAccountId
     * @returns {HbarAllowance}
     */
    static _fromGrantedProtobuf(allowance, ownerAccountId) {
        return new HbarAllowance({
            spenderAccountId: AccountId._fromProtobuf(
                /** @type {HashgraphProto.proto.IAccountID} */ (
                    allowance.spender
                ),
            ),
            ownerAccountId,
            amount: Hbar.fromTinybars(
                allowance.amount != null ? allowance.amount : 0,
            ),
        });
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.ICryptoAllowance}
     */
    _toProtobuf() {
        return {
            owner:
                this.ownerAccountId != null
                    ? this.ownerAccountId._toProtobuf()
                    : null,
            spender:
                this.spenderAccountId != null
                    ? this.spenderAccountId._toProtobuf()
                    : null,
            amount: this.amount != null ? this.amount.toTinybars() : null,
        };
    }

    /**
     * @param {Client} client
     */
    _validateChecksums(client) {
        if (this.spenderAccountId != null) {
            this.spenderAccountId.validateChecksum(client);
        }

        if (this.spenderAccountId != null) {
            this.spenderAccountId.validateChecksum(client);
        }
    }

    /**
     * @returns {object}
     */
    toJSON() {
        return {
            ownerAccountId:
                this.ownerAccountId != null
                    ? this.ownerAccountId.toString()
                    : null,
            spenderAccountId:
                this.spenderAccountId != null
                    ? this.spenderAccountId.toString()
                    : null,
            amount: this.amount != null ? this.amount.toString() : null,
        };
    }
}
