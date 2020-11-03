import EntityId, { fromString, fromSolidityAddress } from "../EntityId.js";
import * as proto from "@hashgraph/proto";

/**
 * The ID for a crypto-currency account on Hedera.
 *
 * @augments {EntityId<proto.IAccountID>}
 */
export default class AccountId extends EntityId {
    /**
     * @param {number | Long | import("../EntityId").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     */
    constructor(props, realm, num) {
        super(props, realm, num);
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
            shard: id.shardNum != null ? id.shardNum : 0,
            realm: id.realmNum != null ? id.realmNum : 0,
            num: id.accountNum != null ? id.accountNum : 0,
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
        const [shard, realm, account] = fromSolidityAddress(address);
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
