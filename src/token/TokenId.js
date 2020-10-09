import EntityId, { fromString } from "../EntityId.js";
import * as proto from "@hashgraph/proto";
import Long from "long";
import * as hex from "../encoding/hex.js";

/**
 * The ID for a crypto-currency token on Hedera.
 *
 * @augments {EntityId<proto.ITokenID>}
 */
export default class TokenId extends EntityId {
    /**
     * @param {number | Long | import("../EntityId.js").IEntityId} properties
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     */
    constructor(properties, realm, num) {
        super(properties, realm, num);
    }

    /**
     * @param {string} text
     * @returns {TokenId}
     */
    static fromString(text) {
        return new TokenId(...fromString(text));
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
        const addr = address.startsWith("0x")
            ? hex.decode(address.slice(2))
            : hex.decode(address);

        if (addr.length !== 20) {
            throw new Error(`Invalid hex encoded solidity address length:
                    expected length 40, got length ${address.length}`);
        }

        const shard = Long.fromBytesBE(Array.from(addr.slice(0, 4)));
        const realm = Long.fromBytesBE(Array.from(addr.slice(4, 12)));
        const token = Long.fromBytesBE(Array.from(addr.slice(12, 20)));

        return new TokenId(shard, realm, token);
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
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.TokenID.encode(this._toProtobuf()).finish();
    }
}
