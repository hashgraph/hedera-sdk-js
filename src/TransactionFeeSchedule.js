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
import RequestType from "./RequestType.js";
import FeeData from "./FeeData.js";

export default class TransactionFeeSchedule {
    /**
     * @param {object} [props]
     * @param {RequestType} [props.hederaFunctionality]
     * @param {FeeData} [props.feeData]
     * @param {FeeData[]} [props.fees]
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

        /*
         * Resource price coefficients
         *
         * @type {FeeData[]}
         */
        this.fees = props.fees;
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {TransactionFeeSchedule}
     */
    static fromBytes(bytes) {
        return TransactionFeeSchedule._fromProtobuf(
            HashgraphProto.proto.TransactionFeeSchedule.decode(bytes)
        );
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ITransactionFeeSchedule} transactionFeeSchedule
     * @returns {TransactionFeeSchedule}
     */
    static _fromProtobuf(transactionFeeSchedule) {
        return new TransactionFeeSchedule({
            hederaFunctionality:
                transactionFeeSchedule.hederaFunctionality != null
                    ? RequestType._fromCode(
                          transactionFeeSchedule.hederaFunctionality
                      )
                    : undefined,
            feeData:
                transactionFeeSchedule.feeData != null
                    ? FeeData._fromProtobuf(transactionFeeSchedule.feeData)
                    : undefined,
            fees:
                transactionFeeSchedule.fees != null
                    ? transactionFeeSchedule.fees.map((fee) =>
                          FeeData._fromProtobuf(fee)
                      )
                    : undefined,
        });
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.ITransactionFeeSchedule}
     */
    _toProtobuf() {
        return {
            hederaFunctionality:
                this.hederaFunctionality != null
                    ? this.hederaFunctionality.valueOf()
                    : undefined,
            feeData:
                this.feeData != null ? this.feeData._toProtobuf() : undefined,
            fees:
                this.fees != null
                    ? this.fees.map((fee) => fee._toProtobuf())
                    : undefined,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.TransactionFeeSchedule.encode(
            this._toProtobuf()
        ).finish();
    }
}
