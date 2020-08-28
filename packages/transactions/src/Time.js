import { root } from "./generated/proto.js";

export default class Time {
    /**
     * @param {number} seconds
     * @param {number} nanos
     */
    constructor(seconds, nanos) {
        /**
         * @type {number}
         */
        this.seconds = seconds;

        /**
         * @type {number}
         */
        this.nanos = nanos;
    }

    /**
     * @returns {Date}
     */
    asDate() {
        return new Date(
            this.seconds * 1000 + Math.floor(this.nanos / 1_000_000)
        );
    }

    /**
     * @param {number | Date} date
     * @returns {Time}
     */
    static fromDate(date) {
        let ms;

        if (typeof date === "number") {
            ms = date;
        } else if (date instanceof Date) {
            ms = date.getTime();
        } else {
            throw new TypeError(
                `Invalid type ${JSON.stringify(date)} is not 'number' or 'Date'`
            );
        }

        const seconds = Math.floor(ms / 1000);
        const nanos = Math.floor(ms % 1000) * 1_000_000;
        return new Time(seconds, nanos);
    }

    /**
     * @returns {root.proto.Timestamp}
     */
    _toProtobuf() {
        const proto = new root.proto.Timestamp();
        proto.setSeconds(this.seconds);
        proto.setNanos(this.nanos);
        return proto;
    }

    /**
     * @param {root.Timestamp} timestamp
     * @returns {Time}
     */
    static _fromProtobuf(timestamp) {
        return new Time(timestamp.getSeconds(), timestamp.getNanos());
    }
}
