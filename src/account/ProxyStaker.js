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

import AccountId from "./AccountId.js";
import Hbar from "../Hbar.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IProxyStaker} HashgraphProto.proto.IProxyStaker
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HashgraphProto.proto.IAccountID
 */

/**
 * @typedef {import("bignumber.js").default} BigNumber
 */

/**
 * An account, and the amount that it sends or receives during a cryptocurrency transfer.
 */
export default class ProxyStaker {
    /**
     * @private
     * @param {object} props
     * @param {AccountId} props.accountId
     * @param {number | string | Long | BigNumber | Hbar} props.amount
     */
    constructor(props) {
        /**
         * The Account ID that sends or receives cryptocurrency.
         *
         * @readonly
         */
        this.accountId = props.accountId;

        /**
         * The amount of tinybars that the account sends(negative)
         * or receives(positive).
         *
         * @readonly
         */
        this.amount =
            props.amount instanceof Hbar
                ? props.amount
                : new Hbar(props.amount);

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IProxyStaker} transfer
     * @returns {ProxyStaker}
     */
    static _fromProtobuf(transfer) {
        return new ProxyStaker({
            accountId: AccountId._fromProtobuf(
                /** @type {HashgraphProto.proto.IAccountID} */ (
                    transfer.accountID
                )
            ),
            amount: Hbar.fromTinybars(
                transfer.amount != null ? transfer.amount : 0
            ),
        });
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.IProxyStaker}
     */
    _toProtobuf() {
        return {
            accountID: this.accountId._toProtobuf(),
            amount: this.amount.toTinybars(),
        };
    }
}
