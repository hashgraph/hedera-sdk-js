import * as proto from "@hashgraph/proto";
import ContractId from "./ContractId.js";
import StorageChange from "./StorageChange.js";

export default class ContractStateChange{
     /**
     * @private
     * @param {object} props
     * @param {ContractId} props.contractId
<<<<<<< HEAD
     * @param {StorageChange[]?} props.storageChanges
=======
     * @param {StorageChange[]} props.storageChanges
>>>>>>> de276018fc5f01a67ab42d6733141e1ff65e8686
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
<<<<<<< HEAD
            storageChanges: change.storageChanges ? change.storageChanges.map(
                storageChange => StorageChange._fromProtobuf(storageChange)
            ) : null
=======
            storageChanges: StorageChange._fromProtobuf(
                /** @type {proto.IStorageChange[]} */ (change.storageChanges) 
            )
>>>>>>> de276018fc5f01a67ab42d6733141e1ff65e8686
        });
    }

    /**
     * @internal
<<<<<<< HEAD
     * @returns {proto.IContractStateChange}
     */
    static _toProtobuf() {
        return {
            contractID: this.contractId._toProtobuf(),
            storageChanges: this.storageChanges
        };
    }

}

=======
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
>>>>>>> de276018fc5f01a67ab42d6733141e1ff65e8686
