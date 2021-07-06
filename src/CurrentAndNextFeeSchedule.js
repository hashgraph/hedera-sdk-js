import * as proto from "@hashgraph/proto";
export default class CurrentAndNextFeeSchedule {
    /**
    * @param {object} props
    * @param {object} props.currentFeeSchedule
    * @param {object} props.nextFeeSchedule
    */
   
    constructor(props) {
        /*
        * Contains current Fee Schedule
        *
        * @type {undefined}
        */
        this.currentFeeSchedule = props.currentFeeSchedule;

        /*
        * Contains next Fee Schedule
        *
        * @type {object}
        */
        this.nextFeeSchedule = props.nextFeeSchedule;
    }

   /**
     * @param {Uint8Array} bytes
     * @returns {CurrentAndNextFeeSchedule}
    */
    static fromBytes(bytes) {
        return CurrentAndNextFeeSchedule.fromProtobuf(proto.CurrentAndNextFeeSchedule.decode(bytes));
    }

    /**
    * @param {proto.ICurrentAndNextFeeSchedule} currentAndNextFeeSchedule
    * @returns {CurrentAndNextFeeSchedule}
    */
    static fromProtobuf(currentAndNextFeeSchedule) {
        return new CurrentAndNextFeeSchedule({
            /** @type {object} */
            currentFeeSchedule: (currentAndNextFeeSchedule.currentFeeSchedule),
            /** @type {object} */
            nextFeeSchedule: (currentAndNextFeeSchedule.nextFeeSchedule),
        });
    }

   /**
     * @returns {proto.ICurrentAndNextFeeSchedule}
     */
    toProtobuf() {
        return {
            currentFeeSchedule: this.currentFeeSchedule,
            nextFeeSchedule: this.nextFeeSchedule,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes(){
       return proto.CurrentAndNextFeeSchedule.encode(this.toProtobuf()).finish();    
    }
}