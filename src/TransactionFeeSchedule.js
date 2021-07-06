import * as proto from "@hashgraph/proto";
export default class TransactionFeeSchedule {
    /**
    * @param {object} props
    * @param {any} props.hederaFunctionality
    * @param {object} props.feeData
    */
   
    constructor(props) {
        /*
        * A particular transaction or query
        *
        * @type {any}
        */
        this.hederaFunctionality = props.hederaFunctionality;

        /*
        * Resource price coefficients
        *
        * @type {object}
        */
        this.feeData = props.feeData;
    }

   /**
     * @param {Uint8Array} bytes
     * @returns {TransactionFeeSchedule}
    */
    static fromBytes(bytes) {
        return TransactionFeeSchedule.fromProtobuf(proto.TransactionFeeSchedule.decode(bytes));
    }

    /**
    * @param {proto.ITransactionFeeSchedule} transactionFeeSchedule
    * @returns {TransactionFeeSchedule}
    */
    static fromProtobuf(transactionFeeSchedule) {
        return new TransactionFeeSchedule({
            /** @type {any} */
            hederaFunctionality: (transactionFeeSchedule.hederaFunctionality),
            /** @type {object} */
            feeData: (transactionFeeSchedule.feeData),
        });
    }

   /**
     * @returns {proto.ITransactionFeeSchedule}
     */
    toProtobuf() {
        return {
            hederaFunctionality: this.hederaFunctionality,
            feeData: this.feeData,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes(){
       return proto.TransactionFeeSchedule.encode(this.toProtobuf()).finish();    
    }
}