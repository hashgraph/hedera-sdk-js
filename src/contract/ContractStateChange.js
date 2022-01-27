import * as proto from "@hashgraph/proto";
import ContractId from "./ContractId.js";
import StorageChange from "./StorageChange.js";

export default class ContractStateChange{
     /**
     * @private
     * @param {object} props
     * @param {ContractId} props.contractId
     * @param {StorageChange[]} props.storageChanges
     */
    constructor(props){
        this.contractId = props.contractId;
        this.storageChanges = props.storageChanges;
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
            storageChanges: StorageChange._fromProtobuf(
                /** @type {proto.IStorageChange[]} */ (change.storageChanges) 
            )
        });
    }

    /**
     * @internal
     * @returns {proto.IContractStateChange} change
     */
    _toProtobuf() {
        const _storageChanges = this.storageChanges.map(storageChange => storageChange._toProtobuf());
        return {
            contractID: this.contractId._toProtobuf(),
            storageChanges: {_storageChanges}
        };
    }

}