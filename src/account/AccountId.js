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
import * as entity_id from "../EntityIdHelper.js";
import * as HashgraphProto from "@hashgraph/proto";
import Key from "../Key.js";
import PublicKey from "../PublicKey.js";
import CACHE from "../Cache.js";
import EvmAddress from "../EvmAddress.js";

/**
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

/**
 * The ID for a crypto-currency account on Hedera.
 */
export default class AccountId {
    /**
     * @param {number | Long | import("../EntityIdHelper").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     * @param {(PublicKey)=} aliasKey
     * @param {(EvmAddress)=} aliasEvmAddress
     */
    constructor(props, realm, num, aliasKey, aliasEvmAddress) {
        const result = entity_id.constructor(props, realm, num);

        this.shard = result.shard;
        this.realm = result.realm;
        this.num = result.num;
        this.aliasKey = aliasKey != null ? aliasKey : null;
        this.aliasEvmAddress = aliasEvmAddress != null ? aliasEvmAddress : null;

        /**
         * @type {string | null}
         */
        this._checksum = null;
    }

    /**
     * @param {string} text
     * @returns {AccountId}
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

        let num = Long.ZERO;
        let aliasKey = undefined;
        let aliasEvmAddress = undefined;

        if (result.numOrHex.length < 20) {
            num = Long.fromString(result.numOrHex);
        } else if (result.numOrHex.length == 40) {
            aliasEvmAddress = EvmAddress.fromString(result.numOrHex);
        } else {
            aliasKey = PublicKey.fromString(result.numOrHex);
        }

        return new AccountId(shard, realm, num, aliasKey, aliasEvmAddress);
    }

    /**
     * @param {Long | number} shard
     * @param {Long | number} realm
     * @param {EvmAddress | string} evmAddress
     * @returns {AccountId}
     */
    static fromEvmAddress(shard, realm, evmAddress) {
        return new AccountId(
            shard,
            realm,
            0,
            undefined,
            typeof evmAddress === "string"
                ? EvmAddress.fromString(evmAddress)
                : evmAddress
        );
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IAccountID} id
     * @returns {AccountId}
     */
    static _fromProtobuf(id) {
        let aliasKey = undefined;
        let aliasEvmAddress = undefined;
        if (id.alias != null) {
            if (id.alias.length === 20) {
                aliasEvmAddress = EvmAddress.fromBytes(id.alias);
            } else {
                aliasKey = Key._fromProtobufKey(
                    HashgraphProto.proto.Key.decode(id.alias)
                );
            }
        }

        if (!(aliasKey instanceof PublicKey)) {
            aliasKey = undefined;
        }

        return new AccountId(
            id.shardNum != null ? id.shardNum : 0,
            id.realmNum != null ? id.realmNum : 0,
            id.accountNum != null ? id.accountNum : 0,
            aliasKey,
            aliasEvmAddress
        );
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
        if (this.aliasKey != null) {
            throw new Error(
                "cannot calculate checksum with an account ID that has a aliasKey"
            );
        }

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
     * @returns {AccountId}
     */
    static fromBytes(bytes) {
        return AccountId._fromProtobuf(
            HashgraphProto.proto.AccountID.decode(bytes)
        );
    }

    /**
     * @param {string} address
     * @returns {AccountId}
     */
    static fromSolidityAddress(address) {
        return new AccountId(...entity_id.fromSolidityAddress(address));
    }

    /**
     * @returns {string}
     */
    toSolidityAddress() {
        return entity_id.toSolidityAddress([this.shard, this.realm, this.num]);
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.IAccountID}
     */
    _toProtobuf() {
        let alias = null;
        if (this.aliasKey != null) {
            alias = HashgraphProto.proto.Key.encode(
                this.aliasKey._toProtobufKey()
            ).finish();
        } else if (this.aliasEvmAddress != null) {
            alias = this.aliasEvmAddress._bytes;
        }

        return {
            alias,
            accountNum:
                this.aliasKey != null || this.aliasEvmAddress != null
                    ? null
                    : this.num,
            shardNum: this.shard,
            realmNum: this.realm,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.AccountID.encode(
            this._toProtobuf()
        ).finish();
    }

    /**
     * @returns {string}
     */
    toString() {
        let account = this.num.toString();

        if (this.aliasKey != null) {
            account = this.aliasKey.toString();
        } else if (this.aliasEvmAddress != null) {
            account = this.aliasEvmAddress.toString();
        }

        return `${this.shard.toString()}.${this.realm.toString()}.${account}`;
    }

    /**
     * @param {Client} client
     * @returns {string}
     */
    toStringWithChecksum(client) {
        if (this.aliasKey != null) {
            throw new Error(
                "cannot calculate checksum with an account ID that has a aliasKey"
            );
        }

        return entity_id.toStringWithChecksum(this.toString(), client);
    }

    /**
     * @param {this} other
     * @returns {boolean}
     */
    equals(other) {
        let account = false;

        if (this.aliasKey != null && other.aliasKey != null) {
            account = this.aliasKey.equals(other.aliasKey);
        } else if (this.aliasKey == null && other.aliasKey == null) {
            account = this.num.eq(other.num);
        }

        return (
            this.shard.eq(other.shard) && this.realm.eq(other.realm) && account
        );
    }

    /**
     * @returns {AccountId}
     */
    clone() {
        const id = new AccountId(this);
        id._checksum = this._checksum;
        id.aliasKey = this.aliasKey;
        id.aliasEvmAddress = this.aliasEvmAddress;
        return id;
    }

    /**
     * @param {AccountId} other
     * @returns {number}
     */
    compare(other) {
        let comparison = this.shard.compare(other.shard);
        if (comparison != 0) {
            return comparison;
        }

        comparison = this.realm.compare(other.realm);
        if (comparison != 0) {
            return comparison;
        }

        if (this.aliasKey != null && other.aliasKey != null) {
            const t = this.aliasKey.toString();
            const o = other.aliasKey.toString();

            if (t > o) {
                return 1;
            } else if (t < o) {
                return -1;
            } else {
                return 0;
            }
        } else if (this.aliasKey == null && other.aliasKey == null) {
            return this.num.compare(other.num);
        } else {
            return 1;
        }
    }
}

CACHE.setAccountIdConstructor(
    (shard, realm, key) => new AccountId(shard, realm, Long.ZERO, key)
);
