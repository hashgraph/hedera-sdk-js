import Key from "./Key";

/**
 * @augments {Array<Key>}
 */
export default class KeyList extends Array {
    /**
     * @param {number} [threshold]
     */
    constructor(threshold) {
        super();

        /**
         * @private
         * @type {?number}
         */
        this.threshold = threshold == null ? null : threshold;
    }

    /**
     * @param {number} threshold
     * @returns {KeyList}
     */
    static withThreshold(threshold) {
        return new KeyList(threshold);
    }
}
