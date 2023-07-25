/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2023 Hedera Hashgraph, LLC
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
import FeeComponents from "./FeeComponents.js";
import FeeDataType from "./FeeDataType.js";

export default class FeeData {
    /**
     * @param {object} [props]
     * @param {FeeComponents} [props.nodedata]
     * @param {FeeComponents} [props.networkdata]
     * @param {FeeComponents} [props.servicedata]
     * @param {FeeDataType} [props.feeDataType]
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

        /*
         * SubType distinguishing between different types of FeeData, correlating to the same HederaFunctionality
         *
         * @type {SubType}
         */
        this.feeDataType = props.feeDataType;
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {FeeData}
     */
    static fromBytes(bytes) {
        return FeeData._fromProtobuf(
            HashgraphProto.proto.FeeData.decode(bytes)
        );
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IFeeData} feeData
     * @returns {FeeData}
     */
    static _fromProtobuf(feeData) {
        return new FeeData({
            nodedata:
                feeData.nodedata != null
                    ? FeeComponents._fromProtobuf(feeData.nodedata)
                    : undefined,
            networkdata:
                feeData.networkdata != null
                    ? FeeComponents._fromProtobuf(feeData.networkdata)
                    : undefined,
            servicedata:
                feeData.servicedata != null
                    ? FeeComponents._fromProtobuf(feeData.servicedata)
                    : undefined,
            feeDataType:
                feeData.subType != null
                    ? FeeDataType._fromCode(feeData.subType)
                    : undefined,
        });
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.IFeeData}
     */
    _toProtobuf() {
        return {
            nodedata:
                this.nodedata != null ? this.nodedata._toProtobuf() : undefined,

            networkdata:
                this.networkdata != null
                    ? this.networkdata._toProtobuf()
                    : undefined,

            servicedata:
                this.servicedata != null
                    ? this.servicedata._toProtobuf()
                    : undefined,

            subType:
                this.feeDataType != null
                    ? this.feeDataType.valueOf()
                    : undefined,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.FeeData.encode(this._toProtobuf()).finish();
    }
}
