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
     * @param {number | Long | import("../EntityIdHelper.js").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     */
    constructor(props, realm, num) {
        const [shard_num, realm_num, token_num] = entity_id.constructor(
            props,
            realm,
            num
        );

        this.shard = shard_num;
        this.realm = realm_num;
        this.num = token_num;
    }

    /**
     * @param {string} text
     * @returns {TokenId}
     */
    static fromString(text) {
        return new TokenId(...entity_id.fromString(text));
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
        return `${this.shard.toString()}.${this.realm.toString()}.${this.num.toString()}`;
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.TokenID.encode(this._toProtobuf()).finish();
    }
}
