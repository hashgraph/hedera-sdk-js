import EntityId, { fromString, fromSolidityAddress } from "../EntityId.js";
import * as proto from "@hashgraph/proto";

/**
 * The ID for a crypto-currency contract on Hedera.
 *
 * @augments {EntityId<proto.IContractID>}
 */
export default class ContractId extends EntityId {
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
            shard: id.shardNum != null ? id.shardNum : 0,
            realm: id.realmNum != null ? id.realmNum : 0,
            num: id.contractNum != null ? id.contractNum : 0,
        });
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {ContractId}
     */
    static fromBytes(bytes) {
        return ContractId._fromProtobuf(proto.ContractID.decode(bytes));
    }

    /**
     * @param {string} address
     * @returns {ContractId}
     */
    static fromSolidityAddress(address) {
        const [shard, realm, contract] = fromSolidityAddress(address);
        return new ContractId(shard, realm, contract);
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

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.ContractID.encode(this._toProtobuf()).finish();
    }
}
