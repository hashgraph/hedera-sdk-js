/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2022 Hedera Hashgraph, LLC
 * ​
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ‍
 */

import * as HashgraphProto from "@hashgraph/proto";

export default class FeeComponents {
    /**
     * @param {object} [props]
     * @param {Long} [props.min]
     * @param {Long} [props.max]
     * @param {Long} [props.constant]
     * @param {Long} [props.transactionBandwidthByte]
     * @param {Long} [props.transactionVerification]
     * @param {Long} [props.transactionRamByteHour]
     * @param {Long} [props.transactionStorageByteHour]
     * @param {Long} [props.contractTransactionGas]
     * @param {Long} [props.transferVolumeHbar]
     * @param {Long} [props.responseMemoryByte]
     * @param {Long} [props.responseDiskByte]
     */
    constructor(props = {}) {
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
        return FeeComponents._fromProtobuf(
            HashgraphProto.proto.FeeComponents.decode(bytes)
        );
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IFeeComponents} feeComponents
     * @returns {FeeComponents}
     */
    static _fromProtobuf(feeComponents) {
        return new FeeComponents({
            min: feeComponents.min != null ? feeComponents.min : undefined,
            max: feeComponents.max != null ? feeComponents.max : undefined,
            constant:
                feeComponents.constant != null
                    ? feeComponents.constant
                    : undefined,
            transactionBandwidthByte:
                feeComponents.bpt != null ? feeComponents.bpt : undefined,
            transactionVerification:
                feeComponents.vpt != null ? feeComponents.vpt : undefined,
            transactionRamByteHour:
                feeComponents.rbh != null ? feeComponents.rbh : undefined,
            transactionStorageByteHour:
                feeComponents.sbh != null ? feeComponents.sbh : undefined,
            contractTransactionGas:
                feeComponents.gas != null ? feeComponents.gas : undefined,
            transferVolumeHbar:
                feeComponents.tv != null ? feeComponents.tv : undefined,
            responseMemoryByte:
                feeComponents.bpr != null ? feeComponents.bpr : undefined,
            responseDiskByte:
                feeComponents.sbpr != null ? feeComponents.sbpr : undefined,
        });
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.IFeeComponents}
     */
    _toProtobuf() {
        return {
            min: this.min != null ? this.min : undefined,
            max: this.max != null ? this.max : undefined,
            constant: this.constant != null ? this.constant : undefined,
            bpt:
                this.transactionBandwidthByte != null
                    ? this.transactionBandwidthByte
                    : undefined,
            vpt:
                this.transactionVerification != null
                    ? this.transactionVerification
                    : undefined,
            rbh:
                this.transactionRamByteHour != null
                    ? this.transactionRamByteHour
                    : undefined,
            sbh:
                this.transactionStorageByteHour != null
                    ? this.transactionStorageByteHour
                    : undefined,
            gas:
                this.contractTransactionGas != null
                    ? this.contractTransactionGas
                    : undefined,
            tv:
                this.transferVolumeHbar != null
                    ? this.transferVolumeHbar
                    : undefined,
            bpr:
                this.responseMemoryByte != null
                    ? this.responseMemoryByte
                    : undefined,
            sbpr:
                this.responseDiskByte != null
                    ? this.responseDiskByte
                    : undefined,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.FeeComponents.encode(
            this._toProtobuf()
        ).finish();
    }
}
