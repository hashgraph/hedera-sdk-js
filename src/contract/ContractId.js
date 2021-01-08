import * as entity_id from "../EntityIdHelper.js";
import { Key } from "@hashgraph/cryptography";
import * as proto from "@hashgraph/proto";

/**
 * The ID for a crypto-currency contract on Hedera.
 */
export default class ContractId extends Key {
    /**
     * @param {number | Long | import("../EntityIdHelper").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     */
    constructor(props, realm, num) {
        super();

        const [shard_num, realm_num, contract_num] = entity_id.constructor(
            props,
            realm,
            num
        );

        this.shard = shard_num;
        this.realm = realm_num;
        this.num = contract_num;
    }

    /**
     * @param {string} text
     * @returns {ContractId}
     */
    static fromString(text) {
        return new ContractId(...entity_id.fromString(text));
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
        const [shard, realm, contract] = entity_id.fromSolidityAddress(address);
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
        return proto.ContractID.encode(this._toProtobuf()).finish();
    }
}
