import EntityId, { fromString } from "../EntityId";
import proto from "@hashgraph/proto";
import Long from "long";

/**
 * The ID for a crypto-currency account on Hedera.
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
            shard: id.shardNum ?? 0,
            realm: id.realmNum ?? 0,
            num: id.accountNum ?? 0,
        });
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
}
