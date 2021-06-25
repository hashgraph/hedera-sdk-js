import * as entity_id from "../EntityIdHelper.js";
import { Key } from "@hashgraph/cryptography";
import * as proto from "@hashgraph/proto";

/**
 * @typedef {import("long").Long} Long
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

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

        const result = entity_id.constructor(props, realm, num);

        this.shard = result.shard;
        this.realm = result.realm;
        this.num = result.num;

        /**
         * @type {string | null}
         */
        this._checksum = null;
    }

    /**
     * @param {string} text
     * @returns {ContractId}
     */
    static fromString(text) {
        const result = entity_id.fromString(text);
        const id = new ContractId(result);
        id._checksum = result.checksum;
        return id;
    }

    /**
     * @internal
     * @param {proto.IContractID} id
     * @param {(string | null)=} ledgerId
     * @returns {ContractId}
     */
    static _fromProtobuf(id, ledgerId) {
        const contractId = new ContractId(
            id.shardNum != null ? id.shardNum : 0,
            id.realmNum != null ? id.realmNum : 0,
            id.contractNum != null ? id.contractNum : 0
        );

        if (ledgerId != null) {
            contractId._setNetwork(ledgerId);
        }

        return contractId;
    }

    /**
     * @internal
     * @param {Client} client
     */
    _setNetworkWith(client) {
        if (client._network._ledgerId != null) {
            this._setNetwork(client._network._ledgerId);
        }
    }

    /**
     * @internal
     * @param {string} ledgerId
     */
    _setNetwork(ledgerId) {
        this._checksum = entity_id._checksum(
            ledgerId,
            `${this.shard.toString()}.${this.realm.toString()}.${this.num.toString()}`
        );
    }

    /**
     * @param {Client} client
     */
    validate(client) {
        if (
            client._network._ledgerId != null &&
            this._checksum !=
                entity_id._checksum(
                    client._network._ledgerId,
                    `${this.shard.toString()}.${this.realm.toString()}.${this.num.toString()}`
                )
        ) {
            throw new Error("Entity ID is for a different network than client");
        }
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
        const id = new ContractId(this);
        id._checksum = this._checksum;
        return id;
    }
}
