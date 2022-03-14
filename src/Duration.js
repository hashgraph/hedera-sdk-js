import Long from "long";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IDuration} HashgraphProto.proto.IDuration
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
