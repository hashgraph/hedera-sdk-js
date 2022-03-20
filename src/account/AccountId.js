import Long from "long";
import * as entity_id from "../EntityIdHelper.js";
import * as HashgraphProto from "@hashgraph/proto";
import Key from "../Key.js";
import PublicKey from "../PublicKey.js";
import CACHE from "../Cache.js";

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
     */
    constructor(props, realm, num, aliasKey) {
        const result = entity_id.constructor(props, realm, num);

        this.shard = result.shard;
        this.realm = result.realm;
        this.num = result.num;
        this.aliasKey = aliasKey != null ? aliasKey : null;

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
        const [num, publicKey] =
            result.numOrHex.length < 20
                ? [Long.fromString(result.numOrHex), undefined]
                : [Long.ZERO, PublicKey.fromString(result.numOrHex)];

        return new AccountId(shard, realm, num, publicKey);
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IAccountID} id
     * @returns {AccountId}
     */
    static _fromProtobuf(id) {
        let key =
            id.alias != null && id.alias.length > 0
                ? Key._fromProtobufKey(
                      HashgraphProto.proto.Key.decode(id.alias)
                  )
                : undefined;

        if (!(key instanceof PublicKey)) {
            key = undefined;
        }

        return new AccountId(
            id.shardNum != null ? id.shardNum : 0,
            id.realmNum != null ? id.realmNum : 0,
            id.accountNum != null ? id.accountNum : 0,
            key
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
        return {
            alias:
                this.aliasKey != null
                    ? HashgraphProto.proto.Key.encode(
                          this.aliasKey._toProtobufKey()
                      ).finish()
                    : null,
            accountNum: this.num,
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
        const account =
            this.aliasKey != null
                ? this.aliasKey.toString()
                : this.num.toString();

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
            return 0;
        }
    }
}

CACHE.accountIdConstructor = (shard, realm, key) =>
    new AccountId(shard, realm, Long.ZERO, key);
