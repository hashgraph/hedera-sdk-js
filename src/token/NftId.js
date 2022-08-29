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

import * as HashgraphProto from "@hashgraph/proto";
import TokenId from "../token/TokenId.js";
import Long from "long";

/**
 * The ID for a crypto-currency token on Hedera.
 *
 * @augments {EntityId<HashgraphProto.proto.INftID>}
 */
export default class NftId {
    /**
     * @param {TokenId} token
     * @param {number | Long} serial
     */
    constructor(token, serial) {
        this.tokenId = token;
        this.serial =
            typeof serial === "number" ? Long.fromNumber(serial) : serial;

        Object.freeze(this);
    }

    /**
     * @param {string} text
     * @returns {NftId}
     */
    static fromString(text) {
        const strings =
            text.split("/").length > 1 ? text.split("/") : text.split("@");

        for (const string of strings) {
            if (string === "") {
                throw new Error(
                    "invalid format for NftId: use [token]/[serial] or [token]@[serial]"
                );
            }
        }

        const token = TokenId.fromString(strings[0]);
        const serial = Long.fromString(strings[1]);

        return new NftId(token, serial);
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.INftID} id
     * @returns {NftId}
     */
    static _fromProtobuf(id) {
        return new NftId(
            TokenId._fromProtobuf(
                /** @type {HashgraphProto.proto.ITokenID} */ (id.tokenID)
            ),
            id.serialNumber != null ? id.serialNumber : Long.ZERO
        );
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {NftId}
     */
    static fromBytes(bytes) {
        return NftId._fromProtobuf(HashgraphProto.proto.NftID.decode(bytes));
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.INftID}
     */
    _toProtobuf() {
        return {
            tokenID: this.tokenId._toProtobuf(),
            serialNumber: Long.fromValue(
                this.serial !== undefined ? this.serial : 0
            ),
        };
    }

    /**
     * @returns {string}
     */
    toString() {
        return `${this.tokenId.toString()}/${this.serial.toString()}`;
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.NftID.encode(this._toProtobuf()).finish();
    }
}
