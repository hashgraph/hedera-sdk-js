import EntityId, { fromString } from "../EntityId";
import proto from "@hashgraph/proto";
import Long from "long";

/**
 * The ID for a crypto-currency contract on Hedera.
 */
export default class ContractId extends EntityId {
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
     * @returns {ContractId}
     */
    static fromString(text) {
        return new ContractId(...fromString(text));
    }

    /**
     * @internal
     * @param {proto.IContractID} id
     * @returns {ContractId}
     */
    static _fromProtobuf(id) {
        return new ContractId({
            shard: id.shardNum ?? 0,
            realm: id.realmNum ?? 0,
            num: id.contractNum ?? 0,
        });
    }

    /**
     * @override
     * @internal
     * @returns {proto.IContractID}
     */
    _toProtobuf() {
        return {
            contractNum: this.num,
            shardNum: this.shard,
            realmNum: this.realm,
        };
    }
}
