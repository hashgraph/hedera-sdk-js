import * as proto from "@hashgraph/proto";
export default class FeeComponents {
    /**
     * @param {object} props
     * @param {Long} props.min
     * @param {Long} props.max
     * @param {Long} props.constant
     * @param {Long} props.transactionBandwidthByte
     * @param {Long} props.transactionVerification
     * @param {Long} props.transactionRamByteHour
     * @param {Long} props.transactionStorageByteHour
     * @param {Long} props.contractTransactionGas
     * @param {Long} props.transferVolumeHbar
     * @param {Long} props.responseMemoryByte
     * @param {Long} props.responseDiskByte
     */
    constructor(props) {
        /*
         * A minimum, the calculated fee must be greater than this value
         *
         * @type {Long}
         */
        this.min = props.min;
        /*
         * A maximum, the calculated fee must be less than this value
         *
         * @type {Long}
         */
        this.max = props.max;
        /*
         * A constant contribution to the fee
         *
         * @type {Long}
         */
        this.constant = props.constant;
        /*
         * The price of bandwidth consumed by a transaction, measured in bytes
         *
         * @type {Long}
         */
        this.transactionBandwidthByte = props.transactionBandwidthByte;
        /*
         * The price per signature verification for a transaction
         *
         * @type {Long}
         */
        this.transactionVerification = props.transactionVerification;
        /*
         * The price of RAM consumed by a transaction, measured in byte-hours
         *
         * @type {Long}
         */
        this.transactionRamByteHour = props.transactionRamByteHour;
        /*
         * The price of storage consumed by a transaction, measured in byte-hours
         *
         * @type {Long}
         */
        this.transactionStorageByteHour = props.transactionStorageByteHour;
        /*
         * The price of computation for a smart contract transaction, measured in gas
         *
         * @type {Long}
         */
        this.contractTransactionGas = props.contractTransactionGas;
        /*
         * The price per hbar transferred for a transfer
         *
         * @type {Long}
         */
        this.transferVolumeHbar = props.transferVolumeHbar;
        /*
         * The price of bandwidth for data retrieved from memory for a response, measured in bytes
         *
         * @type {Long}
         */
        this.responseMemoryByte = props.responseMemoryByte;
        /*
         * The price of bandwidth for data retrieved from disk for a response, measured in bytes
         *
         * @type {Long}
         */
        this.responseDiskByte = props.responseDiskByte;
    }
    /**
     * @param {Uint8Array} bytes
     * @returns {FeeComponents}
     */
    static fromBytes(bytes) {
        return FeeComponents.fromProtobuf(proto.FeeComponents.decode(bytes));
    }
    /**
     * @param {proto.IFeeComponents} feeComponents
     * @returns {FeeComponents}
     */
    static fromProtobuf(feeComponents) {
        return new FeeComponents({
            min: /** @type {Long} */ (feeComponents.min),
            max: /** @type {Long} */ (feeComponents.max),
            constant: /** @type {Long} */ (feeComponents.constant),
            transactionBandwidthByte: /** @type {Long} */ (feeComponents.bpt),
            transactionVerification: /** @type {Long} */ (feeComponents.vpt),
            transactionRamByteHour: /** @type {Long} */ (feeComponents.rbh),
            transactionStorageByteHour: /** @type {Long} */ (feeComponents.sbh),
            contractTransactionGas: /** @type {Long} */ (feeComponents.gas),
            transferVolumeHbar: /** @type {Long} */ (feeComponents.tv),
            responseMemoryByte: /** @type {Long} */ (feeComponents.bpr),
            responseDiskByte: /** @type {Long} */ (feeComponents.sbpr),
        });
    }
    /**
     * @returns {proto.IFeeComponents}
     */
    toProtobuf() {
        return {
            min: this.min,
            max: this.max,
            constant: this.constant,
            bpt: this.transactionBandwidthByte,
            vpt: this.transactionVerification,
            rbh: this.transactionRamByteHour,
            sbh: this.transactionStorageByteHour,
            gas: this.contractTransactionGas,
            tv: this.transferVolumeHbar,
            bpr: this.responseMemoryByte,
            sbpr: this.responseDiskByte,
        };
    }
    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.FeeComponents.encode(this.toProtobuf()).finish();
    }
}