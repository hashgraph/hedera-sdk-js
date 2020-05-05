import PublicKey from "./public_key.js";

/**
 * Currently this has no effect on compilation since `@abstract` is not recognized by TS
 * as of this moment: https://github.com/Microsoft/TypeScript/issues/17227
 *
 * @abstract
 */
export default class Key {
    /**
     * @abstract
     * @returns {PublicKey}
     */
    get publicKey() {
        throw new Error("(BUG) `Key.getPublicKey()` should never be called.");
    }
}
