export default class Key {
    /**
     * Converts this key into bytes.
     *
     * @abstract
     * @returns {Uint8Array}
     */
    toBytes() {
        throw new Error("not implemented");
    }
}
