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

import Long from "long";
import TokenId from "../token/TokenId.js";
import AccountId from "../account/AccountId.js";
import ObjectMap from "../ObjectMap.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenTransferList} HashgraphProto.proto.ITokenTransferList
 * @typedef {import("@hashgraph/proto").proto.INftTransfer} HashgraphProto.proto.INftTransfer
 * @typedef {import("@hashgraph/proto").proto.IAccountAmount} HashgraphProto.proto.IAccountAmount
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HashgraphProto.proto.ITokenID
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HashgraphProto.proto.IAccountID
 */

/**
 * @typedef {object} NftTransfer
 * @property {AccountId} sender
 * @property {AccountId} recipient
 * @property {Long} serial
 * @property {boolean} isApproved
 */

/**
 * @augments {ObjectMap<TokenId, NftTransfer[]>}
 */
export default class TokenNftTransferMap extends ObjectMap {
    constructor() {
        super((s) => TokenId.fromString(s));
    }

    /**
     * @internal
     * @param {TokenId} tokenId
     * @param {NftTransfer} nftTransfer
     */
    __set(tokenId, nftTransfer) {
        const token = tokenId.toString();

        let _map = this._map.get(token);
        if (_map == null) {
            _map = [];
            this._map.set(token, _map);
            this.__map.set(tokenId, _map);
        }

        _map.push(nftTransfer);
    }

    /**
     * @param {HashgraphProto.proto.ITokenTransferList[]} transfers
     * @returns {TokenNftTransferMap}
     */
    static _fromProtobuf(transfers) {
        const tokenTransfersMap = new TokenNftTransferMap();

        for (const transfer of transfers) {
            const token = TokenId._fromProtobuf(
                /** @type {HashgraphProto.proto.ITokenID} */ (transfer.token)
            );

            for (const aa of transfer.nftTransfers != null
                ? transfer.nftTransfers
                : []) {
                const sender = AccountId._fromProtobuf(
                    /** @type {HashgraphProto.proto.IAccountID} */ (
                        aa.senderAccountID
                    )
                );
                const recipient = AccountId._fromProtobuf(
                    /** @type {HashgraphProto.proto.IAccountID} */ (
                        aa.receiverAccountID
                    )
                );

                tokenTransfersMap.__set(token, {
                    sender,
                    recipient,
                    serial: Long.fromValue(
                        /** @type {Long} */ (aa.serialNumber)
                    ),
                    isApproved: false,
                });
            }
        }

        return tokenTransfersMap;
    }

    /**
     * @returns {HashgraphProto.proto.ITokenTransferList[]}
     */
    _toProtobuf() {
        /** @type {HashgraphProto.proto.ITokenTransferList[]} */
        const tokenTransferList = [];

        for (const [tokenId, value] of this) {
            /** @type {HashgraphProto.proto.INftTransfer[]} */
            const transfers = [];

            for (const transfer of value) {
                transfers.push({
                    senderAccountID: transfer.sender._toProtobuf(),
                    receiverAccountID: transfer.recipient._toProtobuf(),
                    serialNumber: transfer.serial,
                });
            }

            tokenTransferList.push({
                token: tokenId._toProtobuf(),
                nftTransfers: transfers,
            });
        }

        return tokenTransferList;
    }
}
