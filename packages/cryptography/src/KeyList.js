import Key from "./Key";

export default class KeyList {
    /**
     * @internal
     * @hideconstructor
     * @param {?number} [threshold]
     * @param {Key[]} [keys]
     */
    constructor(threshold, keys) {
        /**
         * @private
         * @type {Key[]}
         */
        this._keys = keys == null ? [] : keys;

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

    /**
     * @param {Key[]} keys
     * @returns {KeyList}
     */
    static of(...keys) {
        return new KeyList(null, keys);
    }

    /**
     * @template T
     * @param {ArrayLike<Key>} arrayLike
     * @param {((key: Key) => Key)} [mapFn]
     * @param {T} [thisArg]
     * @returns {KeyList}
     */
    static from(arrayLike, mapFn, thisArg) {
        if (mapFn == null) {
            return new KeyList(null, Array.from(arrayLike));
        }

        return new KeyList(null, Array.from(arrayLike, mapFn, thisArg));
    }

    /**
     * @param {Key[]} keys
     * @returns {number}
     */
    push(...keys) {
        return this._keys.push(...keys);
    }

    /**
     * @param {number} start
     * @param {number} deleteCount
     * @param {Key[]} items
     * @returns {KeyList}
     */
    splice(start, deleteCount, ...items) {
        return new KeyList(
            this.threshold,
            this._keys.splice(start, deleteCount, ...items)
        );
    }

    /**
     * @param {number=} start
     * @param {number=} end
     * @returns {KeyList}
     */
    slice(start, end) {
        return new KeyList(this.threshold, this._keys.slice(start, end));
    }

    /**
     * @returns {Iterator<Key>}
     */
    [Symbol.iterator]() {
        return this._keys[Symbol.iterator]();
    }
}
