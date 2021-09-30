import Long from "long";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IDuration} proto.IDuration
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
     * @returns {proto.IDuration}
     */
    _toProtobuf() {
        return {
            seconds: this.seconds,
        };
    }

    /**
     * @internal
     * @param {proto.IDuration} duration
     * @returns {Duration}
     */
    static _fromProtobuf(duration) {
        return new Duration(/** @type {Long} */ (duration.seconds));
    }

    /**
     * @param {string} seconds
     * @returns {Duration}
     */
    static fromString(seconds) {
        return new Duration(Long.fromString(seconds));
    }

    /**
     * @returns {string}
     */
    toString() {
        return this.seconds.toString();
    }
}
