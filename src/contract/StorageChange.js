import BigNumber from "bignumber.js";
import * as proto from "@hashgraph/proto";
import { toSolidityAddress } from "../EntityIdHelper";

export default class StorageChange{
         /**
     * @private
     * @param {object} props
     * @param {BigNumber} props.slot
     * @param {BigNumber?} props.valueRead
     * @param {BigNumber?} props.valueWritten 
     */
    constructor(props){
        this.slot = props.slot;
        this.valueRead = props.valueRead;
        this.valueWritten = props.valueWritten;
    }

    /**
     * @internal
     * @param change
     * @param {IStorageChange} change, 
     * @returns {StorageChange}
     */
    static _fromProtobuf(change) {
        const storageChange = new StorageChange(
            {
                slot: change.slot !=null ? change.slot : undefined, 
                valueRead: change.valueRead !=null ? change.valueRead : undefined, 
                valueWritten: change.valueWritten !=null ? change.valueWritten : undefined 
            }
        );
        return storageChange;
    }


    /**
     * @internal
     * @returns {proto.IStorageChange}
     */
    _toProtobuf(){
        return {
            slot : this.slot,
            valueRead: this.valueRead,
            valueWritten: this.valueWritten
        }
    }
}