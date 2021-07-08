import * as proto from "@hashgraph/proto";

export default class TransactionFeeSchedule {
    /**
    * @param {object} [props]
    * @param {RequestType} [props.hederaFunctionality]
    * @param {FeeData} [props.feeData]
    */
   
    constructor(props = {}) {
        /*
        * A particular transaction or query
        *
        * @type {RequestType}
        */
        this.hederaFunctionality = props.hederaFunctionality;

        /*
        * Resource price coefficients
        *
        * @type {FeeData}
        */
        this.feeData = props.feeData;
    }

   /**
     * @param {Uint8Array} bytes
     * @returns {TransactionFeeSchedule}
    */
    static fromBytes(bytes) {
        return TransactionFeeSchedule._fromProtobuf(proto.TransactionFeeSchedule.decode(bytes));
    }

    /**
    * @internal
    * @param {proto.ITransactionFeeSchedule} transactionFeeSchedule
    * @returns {TransactionFeeSchedule}
    */
    static _fromProtobuf(transactionFeeSchedule) {
        return new TransactionFeeSchedule({
            /** @type {RequestType} */
            hederaFunctionality: (transactionFeeSchedule.hederaFunctionality),
            /** @type {FeeData} */
            feeData: (transactionFeeSchedule.feeData),
        });
    }

   /**
    * @internal
     * @returns {proto.ITransactionFeeSchedule}
     */
    _toProtobuf() {
        return {
            hederaFunctionality: this.hederaFunctionality,
            feeData: this.feeData,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes(){
       return proto.TransactionFeeSchedule.encode(this._toProtobuf()).finish();    
    }
}