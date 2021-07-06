import * as proto from "@hashgraph/proto";
export default class FeeData {
    /**
    * @param {object} props
    * @param {object} props.nodedata
    * @param {object} props.networkdata
    * @param {object} props.servicedata
     */

    constructor(props) {
         /*
         * Fee paid to the submitting node
         *
         * @type {object}
         */
         this.nodedata = props.nodedata;

         /*
         * Fee paid to the network for processing a transaction into consensus
         *
         * @type {object}
         */
         this.networkdata = props.networkdata;

         /*
         * Fee paid to the network for providing the service associated with the transaction; for instance, storing a file
         *
         * @type {object}
         */
         this.servicedata = props.servicedata;
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {FeeData}
    */
    static fromBytes(bytes) {
        return FeeData.fromProtobuf(proto.FeeData.decode(bytes));
    }

    /**
    * @param {proto.IFeeData} feeData
    * @returns {FeeData}
    */
    static fromProtobuf(feeData) {
        return new FeeData({
            /** @type {object} */
            nodedata: (feeData.nodedata),
            /** @type {object} */
            networkdata: (feeData.networkdata),
            /** @type {object} */
            servicedata: (feeData.servicedata),

        });
    }

    /**
     * @returns {proto.IFeeData}
     */
    toProtobuf() {
        return {
            nodedata: this.nodedata,
            networkdata: this.networkdata,
            servicedata: this.servicedata,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes(){
       return proto.FeeData.encode(this.toProtobuf()).finish();    
    }
}