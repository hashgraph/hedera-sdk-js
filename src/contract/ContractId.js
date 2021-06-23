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
     * @param {(string | null)=} networkName
     * @param {(string | null)=} checksum
     */
    constructor(props, realm, num, networkName, checksum) {
        super();

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
     * @returns {ContractId}
     */
    static fromString(text) {
        const result = entity_id.fromString(text);
        return new ContractId(
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
     * @returns {ContractId}
     */
    static withNetwork(props, realm, num, networkName) {
        return new ContractId(props, realm, num, networkName);
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
        return proto.ContractID.encode(this._toProtobuf()).finish();
    }

    /**
     * @returns {ContractId}
     */
    clone() {
        return new ContractId(
            this.shard,
            this.realm,
            this.num,
            this._networkName,
            this._checksum
        );
    }
}
