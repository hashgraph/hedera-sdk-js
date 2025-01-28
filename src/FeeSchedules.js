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
import FeeSchedule from "./FeeSchedule.js";

/**
 * Represents a pair of fee schedules on the Hedera network - the currently active fee schedule
 * and the next upcoming fee schedule. This structure allows for transparent fee updates by making
 * future fee changes visible before they take effect.
 */
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
        return FeeSchedules._fromProtobuf(
            HashgraphProto.proto.CurrentAndNextFeeSchedule.decode(bytes),
        );
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ICurrentAndNextFeeSchedule} feeSchedules
     * @returns {FeeSchedules}
     */
    static _fromProtobuf(feeSchedules) {
        return new FeeSchedules({
            currentFeeSchedule:
                feeSchedules.currentFeeSchedule != null
                    ? FeeSchedule._fromProtobuf(feeSchedules.currentFeeSchedule)
                    : undefined,
            nextFeeSchedule:
                feeSchedules.nextFeeSchedule != null
                    ? FeeSchedule._fromProtobuf(feeSchedules.nextFeeSchedule)
                    : undefined,
        });
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.ICurrentAndNextFeeSchedule}
     */
    _toProtobuf() {
        return {
            currentFeeSchedule:
                this.current != null ? this.current._toProtobuf() : undefined,
            nextFeeSchedule:
                this.next != null ? this.next._toProtobuf() : undefined,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.CurrentAndNextFeeSchedule.encode(
            this._toProtobuf(),
        ).finish();
    }
}
