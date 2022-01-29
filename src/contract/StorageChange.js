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
     */
    constructor(props){
        this.slot = props.slot;
        this.valueRead = props.valueRead;
        this.valueWritten = props.valueWritten;
    }

    /**
     * @param {proto.IStorageChange} change
     * @returns {StorageChange}
     */
    static _fromProtobuf(change) {
        const storageChange = new StorageChange(
            {
                slot: change.slot != null ? change.slot : null, 
                valueRead: change.valueRead != null ? change.valueRead : null, 
                valueWritten: change.valueWritten != null ? change.valueWritten : null 
            }
        );
        return storageChange;
    }


    /**
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