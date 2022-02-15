import * as proto from "@hashgraph/proto";
import ContractId from "./ContractId.js";
import StorageChange from "./StorageChange.js";

export default class ContractStateChange {
    /**
     * @private
     * @param {object} props
     * @param {ContractId} props.contractId
     * @param {StorageChange[]} props.storageChanges
     */
    constructor(props) {
        this.contractId = props.contractId;
        this.storageChanges = props.storageChanges;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.IContractStateChange} change
     * @returns {ContractStateChange}
     */
    static _fromProtobuf(change) {
        return new ContractStateChange({
            contractId: ContractId._fromProtobuf(
                /** @type {proto.IContractID} */ (change.contractID)
            ),
            storageChanges: (change.storageChanges != null
                ? change.storageChanges
                : []
            ).map((change) => StorageChange._fromProtobuf(change)),
        });
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {ContractStateChange}
     */
    static fromBytes(bytes) {
        return ContractStateChange._fromProtobuf(
            proto.ContractStateChange.decode(bytes)
        );
    }

    /**
     * @internal
     * @returns {proto.IContractStateChange} change
     */
    _toProtobuf() {
        const storageChanges = this.storageChanges.map((storageChange) =>
            storageChange._toProtobuf()
        );
        return {
            contractID: this.contractId._toProtobuf(),
            storageChanges,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.ContractStateChange.encode(this._toProtobuf()).finish();
    }
}
