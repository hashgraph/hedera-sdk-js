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

import * as entity_id from "../EntityIdHelper.js";
import * as HashgraphProto from "@hashgraph/proto";
import Long from "long";

/**
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

/**
 * The ID for a crypto-currency file on Hedera.
 */
export default class FileId {
    /**
     * @param {number | Long | import("../EntityIdHelper").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     */
    constructor(props, realm, num) {
        const result = entity_id.constructor(props, realm, num);

        this.shard = result.shard;
        this.realm = result.realm;
        this.num = result.num;

        /**
         * @type {string | null}
         */
        this._checksum = null;
    }

    /**
     * @param {string} text
     * @returns {FileId}
     */
    static fromString(text) {
        const result = entity_id.fromString(text);
        const id = new FileId(result);
        id._checksum = result.checksum;
        return id;
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IFileID} id
     * @returns {FileId}
     */
    static _fromProtobuf(id) {
        const fileId = new FileId(
            id.shardNum != null ? Long.fromString(id.shardNum.toString()) : 0,
            id.realmNum != null ? Long.fromString(id.realmNum.toString()) : 0,
            id.fileNum != null ? Long.fromString(id.fileNum.toString()) : 0,
        );

        return fileId;
    }

    /**
     * @returns {string | null}
     */
    get checksum() {
        return this._checksum;
    }

    /**
     * @deprecated - Use `validateChecksum` instead
     * @param {Client} client
     */
    validate(client) {
        console.warn("Deprecated: Use `validateChecksum` instead");
        this.validateChecksum(client);
    }

    /**
     * @param {Client} client
     */
    validateChecksum(client) {
        entity_id.validateChecksum(
            this.shard,
            this.realm,
            this.num,
            this._checksum,
            client,
        );
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {FileId}
     */
    static fromBytes(bytes) {
        return FileId._fromProtobuf(HashgraphProto.proto.FileID.decode(bytes));
    }

    /**
     * @param {string} address
     * @returns {FileId}
     */
    static fromSolidityAddress(address) {
        const [shard, realm, file] = entity_id.fromSolidityAddress(address);
        return new FileId(shard, realm, file);
    }

    /**
     * @returns {string} solidity address
     */
    toSolidityAddress() {
        return entity_id.toSolidityAddress([this.shard, this.realm, this.num]);
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.IFileID}
     */
    _toProtobuf() {
        return {
            fileNum: this.num,
            shardNum: this.shard,
            realmNum: this.realm,
        };
    }

    /**
     * @returns {string}
     */
    toString() {
        return `${this.shard.toString()}.${this.realm.toString()}.${this.num.toString()}`;
    }

    /**
     * @param {Client} client
     * @returns {string}
     */
    toStringWithChecksum(client) {
        return entity_id.toStringWithChecksum(this.toString(), client);
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.FileID.encode(this._toProtobuf()).finish();
    }

    /**
     * @returns {FileId}
     */
    clone() {
        const id = new FileId(this);
        id._checksum = this._checksum;
        return id;
    }

    /**
     * @param {FileId} other
     * @returns {number}
     */
    compare(other) {
        return entity_id.compare(
            [this.shard, this.realm, this.num],
            [other.shard, other.realm, other.num],
        );
    }
}

/**
 * The public node address book for the current network.
 */
FileId.ADDRESS_BOOK = new FileId(102);

/**
 * The current fee schedule for the network.
 */
FileId.FEE_SCHEDULE = new FileId(111);

/**
 * The current exchange rate of HBAR to USD.
 */
FileId.EXCHANGE_RATES = new FileId(112);
