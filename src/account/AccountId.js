import EntityId, { fromString } from "../EntityId";
import proto from "@hashgraph/proto";
import Long from "long";
import * as hex from "../encoding/hex";

/**
 * The ID for a crypto-currency account on Hedera.
 *
 * @augments {EntityId<proto.IAccountID>}
 */
export default class AccountId extends EntityId {
    /**
     * @param {number | Long | import("../EntityId").IEntityId} properties
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     */
    constructor(properties, realm, num) {
        super(properties, realm, num);
    }

    /**
     * @param {string} text
     * @returns {AccountId}
     */
    static fromString(text) {
        return new AccountId(...fromString(text));
    }

    /**
     * @internal
     * @param {proto.IAccountID} id
     * @returns {AccountId}
     */
    static _fromProtobuf(id) {
        return new AccountId({
            shard: (id.shardNum != null) ? id.shardNum : 0,
            realm: (id.realmNum != null) ? id.realmNum : 0,
            num: (id.accountNum != null) ? id.accountNum : 0,
        });
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {AccountId}
     */
    static fromBytes(bytes) {
        return AccountId._fromProtobuf(proto.AccountID.decode(bytes));
    }

    /**
     * @param {string} address
     * @returns {AccountId}
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
        const account = Long.fromBytesBE(Array.from(addr.slice(12, 20)));

        return new AccountId(shard, realm, account);
    }

    /**
     * @internal
     * @override
     * @returns {proto.IAccountID}
     */
    _toProtobuf() {
        return {
            accountNum: this.num,
            shardNum: this.shard,
            realmNum: this.realm,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.AccountID.encode(this._toProtobuf()).finish();
    }
}
