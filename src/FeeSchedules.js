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
import FeeSchedule from "./FeeSchedule.js";
import * as symbols from "./Symbols.js";

export default class FeeSchedules {
    /**
     * @param {object} [props]
     * @param {FeeSchedule} [props.currentFeeSchedule]
     * @param {FeeSchedule} [props.nextFeeSchedule]
     */
    constructor(props = {}) {
        /*
         * Contains current Fee Schedule
         *
         * @type {FeeSchedule}
         */
        this.current = props.currentFeeSchedule;

        /*
         * Contains next Fee Schedule
         *
         * @type {FeeSchedule}
         */
        this.next = props.nextFeeSchedule;
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {FeeSchedules}
     */
    static fromBytes(bytes) {
        return FeeSchedules[symbols.fromProtobuf](
            HashgraphProto.proto.CurrentAndNextFeeSchedule.decode(bytes)
        );
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ICurrentAndNextFeeSchedule} feeSchedules
     * @returns {FeeSchedules}
     */
    static [symbols.fromProtobuf](feeSchedules) {
        return new FeeSchedules({
            currentFeeSchedule:
                feeSchedules.currentFeeSchedule != null
                    ? FeeSchedule[symbols.fromProtobuf](
                          feeSchedules.currentFeeSchedule
                      )
                    : undefined,
            nextFeeSchedule:
                feeSchedules.nextFeeSchedule != null
                    ? FeeSchedule[symbols.fromProtobuf](
                          feeSchedules.nextFeeSchedule
                      )
                    : undefined,
        });
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.ICurrentAndNextFeeSchedule}
     */
    [symbols.toProtobuf]() {
        return {
            currentFeeSchedule:
                this.current != null
                    ? this.current[symbols.toProtobuf]()
                    : undefined,
            nextFeeSchedule:
                this.next != null ? this.next[symbols.toProtobuf]() : undefined,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.CurrentAndNextFeeSchedule.encode(
            this[symbols.toProtobuf]()
        ).finish();
    }
}
