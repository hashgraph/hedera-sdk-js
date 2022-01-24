import { ContractID } from "@hashgraph/proto";
import StorageChange from "./StorageChange.js";

export default class ContractStateChange{
     /**
     * @private
     * @param {object} props
     * @param {ContractID} props.contractID
     * @param {StorageChange} props.storageChanges
     */
    constructor(props){
        this.contractID = props.contractID;
        this.storageChanges = props.storageChanges;
    }

}