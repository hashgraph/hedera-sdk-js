import * as proto from "@hashgraph/proto";
import TransactionFeeSchedule from "./TransactionFeeSchedule";
import {Timestamp} from "@hashgraph/proto";

export default class FeeSchedule {
    /**
    * @param {object} [props]
    * @param {TransactionFeeSchedule[]} [props.transactionFeeSchedule]
    * @param {Timestamp} [props.expirationTime]
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
        * @type {Timestamp}
        */
        this.expirationTime = props.expirationTime;
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
            transactionFeeSchedule: feeSchedule.transactionFeeSchedule != null ? feeSchedule.transactionFeeSchedule : undefined,
            expirationTime: feeSchedule.expiryTime != null ? feeSchedule.expiryTime : undefined,
        });
    }

   /**
    * @internal
    * @returns {proto.IFeeSchedule}
    */
    _toProtobuf() {
        return {
            transactionFeeSchedule: this.transactionFeeSchedule != null ? this.transactionFeeSchedule : undefined,
            expiryTime: this.expirationTime != null ? this.expirationTime : undefined,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes(){
       return proto.FeeSchedule.encode(this._toProtobuf()).finish();    
    }
}