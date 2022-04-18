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
import AccountId from "../account/AccountId.js";
import TokenId from "./TokenId.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenTransferList} HashgraphProto.proto.ITokenTransferList
 * @typedef {import("@hashgraph/proto").proto.IAccountAmount} HashgraphProto.proto.IAccountAmount
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HashgraphProto.proto.IAccountID
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HashgraphProto.proto.ITokenID
 */

/**
 * @typedef {import("bignumber.js").default} BigNumber
 */

/**
 * An account, and the amount that it sends or receives during a cryptocurrency tokentransfer.
 */
export default class TokenTransfer {
    /**
     * @internal
     * @param {object} props
     * @param {TokenId | string} props.tokenId
     * @param {AccountId | string} props.accountId
     * @param {number | null} props.expectedDecimals
     * @param {Long | number} props.amount
     * @param {boolean} props.isApproved
     */
    constructor(props) {
        /**
         * The Token ID that sends or receives cryptocurrency.
         *
         * @readonly
         */
        this.tokenId =
            props.tokenId instanceof TokenId
                ? props.tokenId
                : TokenId.fromString(props.tokenId);

        /**
         * The Account ID that sends or receives cryptocurrency.
         *
         * @readonly
         */
        this.accountId =
            props.accountId instanceof AccountId
                ? props.accountId
                : AccountId.fromString(props.accountId);

        this.expectedDecimals = props.expectedDecimals;
        this.amount = Long.fromValue(props.amount);
        this.isApproved = props.isApproved;
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ITokenTransferList[]} tokenTransfers
     * @returns {TokenTransfer[]}
     */
    static _fromProtobuf(tokenTransfers) {
        const transfers = [];

        for (const tokenTransfer of tokenTransfers) {
            const tokenId = TokenId._fromProtobuf(
                /** @type {HashgraphProto.proto.ITokenID} */ (
                    tokenTransfer.token
                )
            );
            const expectedDecimals =
                tokenTransfer.expectedDecimals != null
                    ? /** @type {number | null } */ (
                          tokenTransfer.expectedDecimals.value
                      )
                    : null;

            for (const transfer of tokenTransfer.transfers != null
                ? tokenTransfer.transfers
                : []) {
                transfers.push(
                    new TokenTransfer({
                        tokenId,
                        accountId: AccountId._fromProtobuf(
                            /** @type {HashgraphProto.proto.IAccountID} */ (
                                transfer.accountID
                            )
                        ),
                        expectedDecimals,
                        amount:
                            transfer.amount != null
                                ? transfer.amount
                                : Long.ZERO,
                        isApproved: transfer.isApproval == true,
                    })
                );
            }
        }

        return transfers;
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.IAccountAmount}
     */
    _toProtobuf() {
        return {
            accountID: this.accountId._toProtobuf(),
            amount: this.amount,
            isApproval: this.isApproved,
        };
    }
}
