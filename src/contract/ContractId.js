import EntityId, { fromString } from "../EntityId";
import proto from "@hashgraph/proto";
import Long from "long";
import * as hex from "../encoding/hex";

/**
 * The ID for a crypto-currency contract on Hedera.
 *
 * @augments {EntityId<proto.IContractID>}
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
        const addr = address.startsWith("0x")
            ? hex.decode(address.slice(2))
            : hex.decode(address);

        if (addr.length !== 20) {
            throw new Error(`Invalid hex encoded solidity address length:
                    expected length 40, got length ${address.length}`);
        }

        const shard = Long.fromBytesBE(Array.from(addr.slice(0, 4)));
        const realm = Long.fromBytesBE(Array.from(addr.slice(4, 12)));
        const contract = Long.fromBytesBE(Array.from(addr.slice(12, 20)));

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
