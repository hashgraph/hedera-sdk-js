import * as proto from "@hashgraph/proto";

export default class FeeData {
    /**
    * @param {object} [props]
    * @param {FeeComponents} [props.nodedata]
    * @param {FeeComponents} [props.networkdata]
    * @param {FeeComponents} [props.servicedata]
     */

    constructor(props = {}) {
         /*
         * Fee paid to the submitting node
         *
         * @type {FeeComponents}
         */
         this.nodedata = props.nodedata;

         /*
         * Fee paid to the network for processing a transaction into consensus
         *
         * @type {FeeComponents}
         */
         this.networkdata = props.networkdata;

         /*
         * Fee paid to the network for providing the service associated with the transaction; for instance, storing a file
         *
         * @type {FeeComponents}
         */
         this.servicedata = props.servicedata;
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {FeeData}
    */
    static fromBytes(bytes) {
        return FeeData._fromProtobuf(proto.FeeData.decode(bytes));
    }

    /**
    * @internal
    * @param {proto.IFeeData} feeData
    * @returns {FeeData}
    */
    static _fromProtobuf(feeData) {
        return new FeeData({
            /** @type {FeeComponents} */
            nodedata: (feeData.nodedata),
            /** @type {FeeComponents} */
            networkdata: (feeData.networkdata),
            /** @type {FeeComponents} */
            servicedata: (feeData.servicedata),

        });
    }

    /**
    * @internal
     * @returns {proto.IFeeData}
     */
    _toProtobuf() {
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
       return proto.FeeData.encode(this._toProtobuf()).finish();    
    }
}