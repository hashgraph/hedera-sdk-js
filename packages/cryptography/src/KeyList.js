import PublicKey from "./PublicKey";

export default class KeyList {
    /**
     * @param {number | undefined} threshold
     */
    constructor(threshold) {
        /**
         * @type PublicKey[]
         */
        this._keys = []

        /**
         * @type {number | undefined}
         */
        this.threshold = threshold;
    }

    /**
     * @param {number | undefined} threshold
     */
    static withThreshold(threshold) {
        return new KeyList(threshold);
    }

    /**
     * @param {PublicKey[]} keys
     * @returns {KeyList}
     */
    static of(...keys) {
        return new KeyList(undefined).push(...keys);
    }

    /**
     * @template T
     * @param {ArrayLike<PublicKey>} arrayLike
     * @param {(key: PublicKey) => PublicKey} mapFn
     * @param {T} thisArg
     * @returns {KeyList}
     */
    static from(arrayLike, mapFn, thisArg) {
        return new KeyList(undefined).push(...Array.from(arrayLike, mapFn, thisArg));
    }

    /**
     * @param {PublicKey[]} keys
     * @returns {KeyList}
     */
    push(...keys) {
        this._keys.push(...keys);
        return this;
    }

    /**
     * @param {number} start
     * @param {number} deleteCount
     * @param {PublicKey[]} items
     * @returns {KeyList}
     */
    splice(start, deleteCount, ...items) {
        return new KeyList(this.threshold)
            .push(...this._keys.splice(start, deleteCount, ...items));
    }

    /**
     * @param {number | undefined} start
     * @param {number | undefined} end
     * @returns {KeyList}
     */
    slice(start, end) {
        return new KeyList(this.threshold)
            .push(...this._keys.slice(start, end));
    }

    [ Symbol.iterator ]() {
        return this._keys[Symbol.iterator];
    }
}

