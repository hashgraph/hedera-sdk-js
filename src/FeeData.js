import * as proto from "@hashgraph/proto";
import FeeComponents from "./FeeComponents";

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
            nodedata: feeData.nodedata != null ? feeData.nodedata : undefined,
            networkdata: feeData.networkdata != null ? feeData.networkdata : undefined,
            servicedata: feeData.servicedata != null ? feeData.servicedata : undefined,

        });
    }

    /**
    * @internal
     * @returns {proto.IFeeData}
     */
    _toProtobuf() {
        return {
            nodedata: this.nodedata != null ? this.nodedata : undefined,
            networkdata: this.networkdata != null ? this.networkdata : undefined,
            servicedata: this.servicedata != null ? this.servicedata : undefined,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes(){
       return proto.FeeData.encode(this._toProtobuf()).finish();    
    }
}