import * as proto from "@hashgraph/proto";
export default class FeeSchedule {
    /**
    * @param {object} props
    * @param {any} props.transactionFeeSchedule
    * @param {object} props.expiryTime
    */
   
    constructor(props) {
        /*
        * List of price coefficients for network resources
        *
        * @type {any}
        */
        this.transactionFeeSchedule = props.transactionFeeSchedule;

        /*
        * FeeSchedule expiry time
        *
        * @type {object}
        */
        this.expiryTime = props.expiryTime;
    }

   /**
     * @param {Uint8Array} bytes
     * @returns {FeeSchedule}
    */
    static fromBytes(bytes) {
        return FeeSchedule.fromProtobuf(proto.FeeSchedule.decode(bytes));
    }

    /**
    * @param {proto.IFeeSchedule} feeSchedule
    * @returns {FeeSchedule}
    */
    static fromProtobuf(feeSchedule) {
        return new FeeSchedule({
            /** @type {any} */
            transactionFeeSchedule: (feeSchedule.transactionFeeSchedule),
            /** @type {object} */
            expiryTime: (feeSchedule.expiryTime),
        });
    }

   /**
     * @returns {proto.IFeeSchedule}
     */
    toProtobuf() {
        return {
            transactionFeeSchedule: this.transactionFeeSchedule,
            expiryTime: this.expiryTime,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes(){
       return proto.FeeSchedule.encode(this.toProtobuf()).finish();    
    }
}