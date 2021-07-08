import * as proto from "@hashgraph/proto";
export default class TransactionFeeSchedule {
    /**
    * @param {object} props
    * @param {RequestType} props.hederaFunctionality
    * @param {FeeData} props.feeData
    */
   
    constructor(props) {
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
        return TransactionFeeSchedule.fromProtobuf(proto.TransactionFeeSchedule.decode(bytes));
    }

    /**
    * @param {proto.ITransactionFeeSchedule} transactionFeeSchedule
    * @returns {TransactionFeeSchedule}
    */
    static fromProtobuf(transactionFeeSchedule) {
        return new TransactionFeeSchedule({
            /** @type {RequestType} */
            hederaFunctionality: (transactionFeeSchedule.hederaFunctionality),
            /** @type {FeeData} */
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