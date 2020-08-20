import * as hex from "./hex.js";

export default class KeyMismatchError extends Error {
    /**
     * @param {Uint8Array} hmac
     * @param {Uint8Array} expectedHmac
     */
    constructor(hmac, expectedHmac) {
        super("key mismatch when loading from keystore");

        this.name = "KeyMismatchError";

        /**
         * @type {string}
         */
        this._hmac = hex.encode(hmac);

        /**
         * @type {string}
         */
        this._expectedHmac = hex.encode(expectedHmac);
    }
}
