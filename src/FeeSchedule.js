import * as proto from "@hashgraph/proto";

export default class FeeSchedule {
    /**
    * @param {object} [props]
    * @param {TransactionFeeSchedule} [props.transactionFeeSchedule]
    * @param {TimestampSeconds} [props.expiryTime]
    */
   
    constructor(props = {}) {
        /*
        * List of price coefficients for network resources
        *
        * @type {TransactionFeeSchedule}
        */
        this.transactionFeeSchedule = props.transactionFeeSchedule;

        /*
        * FeeSchedule expiry time
        *
        * @type {TimestampSeconds}
        */
        this.expiryTime = props.expiryTime;
    }

   /**
     * @param {Uint8Array} bytes
     * @returns {FeeSchedule}
    */
    static fromBytes(bytes) {
        return FeeSchedule._fromProtobuf(proto.FeeSchedule.decode(bytes));
    }

    /**
    * @internal
    * @param {proto.IFeeSchedule} feeSchedule
    * @returns {FeeSchedule}
    */
    static _fromProtobuf(feeSchedule) {
        return new FeeSchedule({
            /** @type {TransactionFeeSchedule} */
            transactionFeeSchedule: (feeSchedule.transactionFeeSchedule),
            /** @type {TimestampSeconds} */
            expiryTime: (feeSchedule.expiryTime),
        });
    }

   /**
    * @internal
    * @returns {proto.IFeeSchedule}
    */
    _toProtobuf() {
        return {
            transactionFeeSchedule: this.transactionFeeSchedule,
            expiryTime: this.expiryTime,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes(){
       return proto.FeeSchedule.encode(this._toProtobuf()).finish();    
    }
}