import proto from "@hashgraph/proto";
import Long from "long";

export default class Time {
    /**
     * @param {number=} seconds
     * @param {number=} nanos
     */
    constructor(seconds, nanos) {
        // TODO: Generate time
        this.seconds = seconds ?? 0;
        this.nanos = nanos ?? 0;
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
     * @returns {proto.ITimestamp}
     */
    _toProtobuf() {
        return {
            seconds: this.seconds,
            nanos: this.nanos,
        };
    }

    /**
     * @param {proto.ITimestamp} timestamp
     * @returns {Time}
     */
    static _fromProtobuf(timestamp) {
        return new Time(
            timestamp.seconds instanceof Long
                ? timestamp.seconds.toInt()
                : timestamp.seconds ?? 0,
            timestamp.nanos ?? 0
        );
    }
}
