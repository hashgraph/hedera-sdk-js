import CACHE from "../Cache.js";
import ContractId from "./ContractId.js";

/**
 * @namespace {proto}
 * @typedef {import("@hashgraph/proto").IContractID} proto.IContractID
 * @typedef {import("@hashgraph/proto").IKey} proto.IKey
 */

/**
 * @typedef {import("long").Long} Long
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

export default class DelegateContractId extends ContractId {
    /**
     * @param {number | Long | import("../EntityIdHelper").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     */
    constructor(props, realm, num) {
        super(props, realm, num);
    }

    /**
     * @param {string} text
     * @returns {DelegateContractId}
     */
    static fromString(text) {
        return new DelegateContractId(ContractId.fromString(text));
    }

    /**
     * @internal
     * @param {proto.IContractID} id
     * @returns {DelegateContractId}
     */
    static _fromProtobuf(id) {
        return new DelegateContractId(ContractId._fromProtobuf(id));
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {DelegateContractId}
     */
    static fromBytes(bytes) {
        return new DelegateContractId(ContractId.fromBytes(bytes));
    }

    /**
     * @param {string} address
     * @returns {DelegateContractId}
     */
    static fromSolidityAddress(address) {
        return new DelegateContractId(ContractId.fromSolidityAddress(address));
    }

    /**
     * @returns {DelegateContractId}
     */
    clone() {
        const id = new DelegateContractId(this);
        id._checksum = this._checksum;
        return id;
    }

    /**
     * @returns {proto.IKey}
     */
    _toProtobufKey() {
        return {
            delegatableContractId: this._toProtobuf(),
        };
    }

    /**
     * @param {proto.IContractID} key
     * @returns {DelegateContractId}
     */
    static __fromProtobufKey(key) {
        return DelegateContractId._fromProtobuf(key);
    }
}

CACHE.delegateContractId = (key) => DelegateContractId.__fromProtobufKey(key);
