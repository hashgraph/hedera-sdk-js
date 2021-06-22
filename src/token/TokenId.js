import * as entity_id from "../EntityIdHelper.js";
import * as proto from "@hashgraph/proto";

/**
 * @typedef {import("long").Long} Long
 */

/**
 * The ID for a crypto-currency token on Hedera.
 *
 * @augments {EntityId<proto.ITokenID>}
 */
export default class TokenId {
    /**
     * @param {number | Long | import("../EntityIdHelper").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     * @param {(string | null)=} networkName
     * @param {(string | null)=} checksum
     */
    constructor(props, realm, num, networkName, checksum) {
        const result = entity_id.constructor(
            props,
            realm,
            num,
            networkName,
            checksum
        );

        this.shard = result.shard;
        this.realm = result.realm;
        this.num = result.num;
        this._networkName = result.networkName;
        this._checksum = result.checksum;

        Object.freeze(this);
    }

    /**
     * @param {string} text
     * @returns {TokenId}
     */
    static fromString(text) {
        const result = entity_id.fromString(text);
        return new TokenId(
            result.shard,
            result.realm,
            result.num,
            result.networkName,
            result.checksum
        );
    }

    /**
     * @param {number | Long | import("../EntityIdHelper").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     * @param {(string | null)=} networkName
     * @returns {TokenId}
     */
    static withNetwork(props, realm, num, networkName) {
        return new TokenId(props, realm, num, networkName);
    }

    /**
     * @internal
     * @param {proto.ITokenID} id
     * @returns {TokenId}
     */
    static _fromProtobuf(id) {
        return new TokenId({
            shard: id.shardNum != null ? id.shardNum : 0,
            realm: id.realmNum != null ? id.realmNum : 0,
            num: id.tokenNum != null ? id.tokenNum : 0,
        });
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {TokenId}
     */
    static fromBytes(bytes) {
        return TokenId._fromProtobuf(proto.TokenID.decode(bytes));
    }

    /**
     * @param {string} address
     * @returns {TokenId}
     */
    static fromSolidityAddress(address) {
        return new TokenId(...entity_id.fromSolidityAddress(address));
    }

    /**
     * @internal
     * @override
     * @returns {proto.ITokenID}
     */
    _toProtobuf() {
        return {
            tokenNum: this.num,
            shardNum: this.shard,
            realmNum: this.realm,
        };
    }

    /**
     * @override
     * @returns {string}
     */
    toString() {
        if (this._checksum == null) {
            return `${this.shard.toString()}.${this.realm.toString()}.${this.num.toString()}`;
        } else {
            return `${this.shard.toString()}.${this.realm.toString()}.${this.num.toString()}-${
                this._checksum
            }`;
        }
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.TokenID.encode(this._toProtobuf()).finish();
    }
}
