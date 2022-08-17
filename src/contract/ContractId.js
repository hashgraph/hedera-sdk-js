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

import * as entity_id from "../EntityIdHelper.js";
import Key from "../Key.js";
import * as HashgraphProto from "@hashgraph/proto";
import CACHE from "../Cache.js";
import * as hex from "../encoding/hex.js";
import Long from "long";

/**
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

/**
 * The ID for a crypto-currency contract on Hedera.
 */
export default class ContractId extends Key {
    /**
     * @param {number | Long | import("../EntityIdHelper").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     * @param {Uint8Array=} evmAddress
     */
    constructor(props, realm, num, evmAddress) {
        super();

        const result = entity_id.constructor(props, realm, num);

        this.shard = result.shard;
        this.realm = result.realm;
        this.num = result.num;

        this.evmAddress = evmAddress != null ? evmAddress : null;

        /**
         * @type {string | null}
         */
        this._checksum = null;
    }

    /**
     * @param {Long | number} shard
     * @param {Long | number} realm
     * @param {string} evmAddress
     * @returns {ContractId}
     */
    static fromEvmAddress(shard, realm, evmAddress) {
        return new ContractId(shard, realm, 0, hex.decode(evmAddress));
    }

    /**
     * @param {string} text
     * @returns {ContractId}
     */
    static fromString(text) {
        const result = entity_id.fromStringSplitter(text);

        if (Number.isNaN(result.shard) || Number.isNaN(result.realm)) {
            throw new Error("invalid format for entity ID");
        }

        const shard =
            result.shard != null ? Long.fromString(result.shard) : Long.ZERO;
        const realm =
            result.realm != null ? Long.fromString(result.realm) : Long.ZERO;
        const [num, evmAddress] =
            result.numOrHex.length < 40
                ? [Long.fromString(result.numOrHex), undefined]
                : [Long.ZERO, hex.decode(result.numOrHex)];

        return new ContractId(shard, realm, num, evmAddress);
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IContractID} id
     * @returns {ContractId}
     */
    static _fromProtobuf(id) {
        const contractId = new ContractId(
            id.shardNum != null ? id.shardNum : 0,
            id.realmNum != null ? id.realmNum : 0,
            id.contractNum != null ? id.contractNum : 0
        );

        return contractId;
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
            client
        );
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {ContractId}
     */
    static fromBytes(bytes) {
        return ContractId._fromProtobuf(
            HashgraphProto.proto.ContractID.decode(bytes)
        );
    }

    /**
     * @param {string} address
     * @returns {ContractId}
     */
    static fromSolidityAddress(address) {
        const [shard, realm, contract] = entity_id.fromSolidityAddress(address);
        return new ContractId(shard, realm, contract);
    }

    /**
     * @returns {string}
     */
    toSolidityAddress() {
        if (this.evmAddress != null) {
            return hex.encode(this.evmAddress);
        } else {
            return entity_id.toSolidityAddress([
                this.shard,
                this.realm,
                this.num,
            ]);
        }
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.IContractID}
     */
    _toProtobuf() {
        return {
            contractNum: this.num,
            shardNum: this.shard,
            realmNum: this.realm,
            evmAddress: this.evmAddress,
        };
    }

    /**
     * @returns {string}
     */
    toString() {
        if (this.evmAddress != null) {
            return `${this.shard.toString()}.${this.realm.toString()}.${hex.encode(
                this.evmAddress
            )}`;
        } else {
            return `${this.shard.toString()}.${this.realm.toString()}.${this.num.toString()}`;
        }
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
        return HashgraphProto.proto.ContractID.encode(
            this._toProtobuf()
        ).finish();
    }

    /**
     * @returns {ContractId}
     */
    clone() {
        const id = new ContractId(this);
        id._checksum = this._checksum;
        id.evmAddress = this.evmAddress;
        return id;
    }

    /**
     * @param {ContractId} other
     * @returns {number}
     */
    compare(other) {
        return entity_id.compare(
            [this.shard, this.realm, this.num],
            [other.shard, other.realm, other.num]
        );
    }

    /**
     * @returns {HashgraphProto.proto.IKey}
     */
    _toProtobufKey() {
        return {
            contractID: this._toProtobuf(),
        };
    }

    /**
     * @param {HashgraphProto.proto.IContractID} key
     * @returns {ContractId}
     */
    static __fromProtobufKey(key) {
        return ContractId._fromProtobuf(key);
    }
}

CACHE.setContractId((key) => ContractId.__fromProtobufKey(key));
