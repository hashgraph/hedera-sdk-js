<<<<<<< HEAD
import { proto } from "@hashgraph/proto/lib/proto";

/**
 * @namespace {proto}
 */

export default class StorageChange{
         /**
     * 
     * @param {object} props
     * @param {Uint8Array?} props.slot
     * @param {Uint8Array?} props.valueRead
     * @param {import("@hashgraph/proto").IBytesValue?} props.valueWritten 
=======
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
>>>>>>> de276018fc5f01a67ab42d6733141e1ff65e8686
     */
    constructor(props){
        this.slot = props.slot;
        this.valueRead = props.valueRead;
        this.valueWritten = props.valueWritten;
    }

    /**
<<<<<<< HEAD
     * @param {proto.IStorageChange} change
=======
     * @internal
     * @param change
     * @param {IStorageChange} change, 
>>>>>>> de276018fc5f01a67ab42d6733141e1ff65e8686
     * @returns {StorageChange}
     */
    static _fromProtobuf(change) {
        const storageChange = new StorageChange(
            {
<<<<<<< HEAD
                slot: change.slot != null ? change.slot : null, 
                valueRead: change.valueRead != null ? change.valueRead : null, 
                valueWritten: change.valueWritten != null ? change.valueWritten : null 
=======
                slot: change.slot !=null ? change.slot : undefined, 
                valueRead: change.valueRead !=null ? change.valueRead : undefined, 
                valueWritten: change.valueWritten !=null ? change.valueWritten : undefined 
>>>>>>> de276018fc5f01a67ab42d6733141e1ff65e8686
            }
        );
        return storageChange;
    }


    /**
<<<<<<< HEAD
=======
     * @internal
>>>>>>> de276018fc5f01a67ab42d6733141e1ff65e8686
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