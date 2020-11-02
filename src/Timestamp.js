import Long from "long";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITimestamp} proto.ITimestamp
 */

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
        let now = Date.now();
        let jitter = Math.random() * 5000 + 8000;

        return Timestamp.fromDate(now - jitter);
    }

    /**
     * @param {string | number | Date} date
     * @returns {Timestamp}
     */
    static fromDate(date) {
        let ms;

        if (typeof date === "number") {
            ms = date;
        } else if (typeof date === "string") {
            ms = Date.parse(date);
        } else if (date instanceof Date) {
            ms = date.getTime();
        } else {
            throw new TypeError(
                `invalid type '${typeof date}' for 'data', expected 'Date'`
            );
        }

        const seconds = Math.floor(ms / 1000);
        const nanos = Math.floor(ms % 1000) * 1000000;

        return new Timestamp(seconds, nanos);
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
     * @internal
     * @returns {proto.ITimestamp}
     */
    _toProtobuf() {
        return {
            seconds: this.seconds,
            nanos: this.nanos.toInt(),
        };
    }

    /**
     * @internal
     * @param {proto.ITimestamp} timestamp
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
}
