import * as proto from "@hashgraph/proto";

export default class FeeSchedules {
    /**
    * @param {object} [props]
    * @param {FeeSchedule} [props.currentFeeSchedule]
    * @param {FeeSchedule} [props.nextFeeSchedule]
    */
    constructor(props = {}) {
        /*
        * Contains current Fee Schedule
        *
        * @type {FeeSchedule}
        */
        this.currentFeeSchedule = props.currentFeeSchedule;

        /*
        * Contains next Fee Schedule
        *
        * @type {FeeSchedule}
        */
        this.nextFeeSchedule = props.nextFeeSchedule;
    }

   /**
     * @param {Uint8Array} bytes
     * @returns {FeeSchedules}
    */
    static fromBytes(bytes) {
        return FeeSchedules._fromProtobuf(proto.CurrentAndNextFeeSchedule.decode(bytes));
    }

    /**
    * @internal
    * @param {proto.ICurrentAndNextFeeSchedule} feeSchedules
    * @returns {FeeSchedules}
    */
    static _fromProtobuf(feeSchedules) {
        return new FeeSchedules({
            /** @type {FeeSchedule} */
            currentFeeSchedule: (feeSchedules.currentFeeSchedule),
            /** @type {FeeSchedule} */
            nextFeeSchedule: (feeSchedules.nextFeeSchedule),
        });
    }

   /**
    * @internal
    * @returns {proto.ICurrentAndNextFeeSchedule}
    */
    _toProtobuf() {
        return {
            currentFeeSchedule: this.current,
            nextFeeSchedule: this.next,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes(){
       return proto.CurrentAndNextFeeSchedule.encode(this._toProtobuf()).finish();    
    }
}