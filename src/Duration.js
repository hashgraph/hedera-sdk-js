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

import Long from "long";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IDuration} HashgraphProto.proto.IDuration
 */

/**
 * A duration type.
 *
 * The main point of this tyope is for encapsulating the `[to|from]Protobuf()` implementations
 */
export default class Duration {
    /**
     * @param {Long | number} seconds
     */
    constructor(seconds) {
        /**
         * @readonly
         * @type {Long}
         */
        this.seconds =
            seconds instanceof Long ? seconds : Long.fromNumber(seconds);

        Object.freeze(this);
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.IDuration}
     */
    _toProtobuf() {
        return {
            seconds: this.seconds,
        };
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IDuration} duration
     * @returns {Duration}
     */
    static _fromProtobuf(duration) {
        return new Duration(/** @type {Long} */ (duration.seconds));
    }
}
