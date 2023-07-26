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
import Cache from "./Cache.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITimestamp} HashgraphProto.proto.ITimestamp
 */

const MAX_NS = Long.fromNumber(1000000000);

export default class Timestamp {
    /**
     * @param {Long | number} seconds
     * @param {Long | number} nanos
     */
    constructor(seconds, nanos) {
        /**
         * @readonly
         * @type {Long}
         */
        this.seconds =
            seconds instanceof Long ? seconds : Long.fromNumber(seconds);

        /**
         * @readonly
         * @type {Long}
         */
        this.nanos = nanos instanceof Long ? nanos : Long.fromNumber(nanos);

        Object.freeze(this);
    }

    /**
     * @returns {Timestamp}
     */
    static generate() {
        const jitter = Math.floor(Math.random() * 5000) + 8000;
        const now = Date.now() - jitter;
        const seconds = Math.floor(now / 1000) + Cache.timeDrift;
        const nanos =
            Math.floor(now % 1000) * 1000000 +
            Math.floor(Math.random() * 1000000);

        return new Timestamp(seconds, nanos);
    }

    /**
     * @param {string | number | Date} date
     * @returns {Timestamp}
     */
    static fromDate(date) {
        let nanos;

        if (typeof date === "number") {
            nanos = Long.fromNumber(date);
        } else if (typeof date === "string") {
            nanos = Long.fromNumber(Date.parse(date)).mul(1000000);
        } else if (date instanceof Date) {
            nanos = Long.fromNumber(date.getTime()).mul(1000000);
        } else {
            throw new TypeError(
                `invalid type '${typeof date}' for 'data', expected 'Date'`
            );
        }

        return new Timestamp(0, 0).plusNanos(nanos);
    }

    /**
     * @returns {Date}
     */
    toDate() {
        return new Date(
            this.seconds.toInt() * 1000 +
                Math.floor(this.nanos.toInt() / 1000000)
        );
    }

    /**
     * @param {Long | number} nanos
     * @returns {Timestamp}
     */
    plusNanos(nanos) {
        const ns = this.nanos.add(nanos);

        return new Timestamp(this.seconds.add(ns.div(MAX_NS)), ns.mod(MAX_NS));
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.ITimestamp}
     */
    _toProtobuf() {
        return {
            seconds: this.seconds,
            nanos: this.nanos.toInt(),
        };
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ITimestamp} timestamp
     * @returns {Timestamp}
     */
    static _fromProtobuf(timestamp) {
        return new Timestamp(
            timestamp.seconds instanceof Long
                ? timestamp.seconds.toInt()
                : timestamp.seconds != null
                ? timestamp.seconds
                : 0,

            timestamp.nanos != null ? timestamp.nanos : 0
        );
    }

    /**
     * @returns {string}
     */
    toString() {
        const zeroPaddedNanos = String(this.nanos).padStart(9, "0");
        return `${this.seconds.toString()}.${zeroPaddedNanos}`;
    }

    /**
     * @param {Timestamp} other
     * @returns {number}
     */
    compare(other) {
        const comparison = this.seconds.compare(other.seconds);

        if (comparison != 0) {
            return comparison;
        }

        return this.nanos.compare(other.nanos);
    }
}
