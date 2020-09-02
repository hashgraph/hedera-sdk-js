import Key from "./Key";

/**
 * @implements Iterable<Key>
 */
export default class KeyList {
    /**
     * @param {number=} threshold
     */
    constructor(threshold) {
        /**
         * @type Key[]
         */
        this._keys = [];

        /**
         * @type {number=}
         */
        this.threshold = threshold;
    }

    /**
     * @param {number=} threshold
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
        return new KeyList().push(...keys);
    }

    /**
     * @template T
     * @param {ArrayLike<Key>} arrayLike
     * @param {(key: Key) => Key} mapFn
     * @param {T} thisArg
     * @returns {KeyList}
     */
    static from(arrayLike, mapFn, thisArg) {
        return new KeyList().push(...Array.from(arrayLike, mapFn, thisArg));
    }

    /**
     * @param {Key[]} keys
     * @returns {KeyList}
     */
    push(...keys) {
        this._keys.push(...keys);
        return this;
    }

    /**
     * @param {number} start
     * @param {number} deleteCount
     * @param {Key[]} items
     * @returns {KeyList}
     */
    splice(start, deleteCount, ...items) {
        return new KeyList(this.threshold).push(
            ...this._keys.splice(start, deleteCount, ...items)
        );
    }

    /**
     * @param {number=} start
     * @param {number=} end
     * @returns {KeyList}
     */
    slice(start, end) {
        return new KeyList(this.threshold).push(
            ...this._keys.slice(start, end)
        );
    }

    /**
     * @returns {Iterator<Key>}
     */
    [Symbol.iterator]() {
        return this._keys[Symbol.iterator]();
    }
}
