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
import TransactionFeeSchedule from "./TransactionFeeSchedule.js";
import Timestamp from "./Timestamp.js";

/**
 * A set of fee schedules covering all transaction types and query types, along
 * with a specific time at which this fee schedule will expire.
 */
export default class FeeSchedule {
    /**
     * @param {object} [props]
     * @param {TransactionFeeSchedule[]} [props.transactionFeeSchedule]
     * @param {Timestamp} [props.expirationTime]
     */
    constructor(props = {}) {
        /*
         * List of price coefficients for network resources
         *
         * @type {TransactionFeeSchedule}
         */
        this.transactionFeeSchedule = props.transactionFeeSchedule;

        /*
         * FeeSchedule expiry time
         *
         * @type {Timestamp}
         */
        this.expirationTime = props.expirationTime;
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {FeeSchedule}
     */
    static fromBytes(bytes) {
        return FeeSchedule._fromProtobuf(
            HashgraphProto.proto.FeeSchedule.decode(bytes),
        );
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IFeeSchedule} feeSchedule
     * @returns {FeeSchedule}
     */
    static _fromProtobuf(feeSchedule) {
        return new FeeSchedule({
            transactionFeeSchedule:
                feeSchedule.transactionFeeSchedule != null
                    ? feeSchedule.transactionFeeSchedule.map((schedule) =>
                          TransactionFeeSchedule._fromProtobuf(schedule),
                      )
                    : undefined,
            expirationTime:
                feeSchedule.expiryTime != null
                    ? Timestamp._fromProtobuf(feeSchedule.expiryTime)
                    : undefined,
        });
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.IFeeSchedule}
     */
    _toProtobuf() {
        return {
            transactionFeeSchedule:
                this.transactionFeeSchedule != null
                    ? this.transactionFeeSchedule.map((transaction) =>
                          transaction._toProtobuf(),
                      )
                    : undefined,
            expiryTime:
                this.expirationTime != null
                    ? this.expirationTime._toProtobuf()
                    : undefined,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.FeeSchedule.encode(
            this._toProtobuf(),
        ).finish();
    }
}
