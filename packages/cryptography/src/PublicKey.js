import nacl from "tweetnacl";
import Key from "./Key.js";
import { arrayEqual, arrayStartsWith } from "./util/array.js";
import BadKeyError from "./BadKeyError.js";
import * as hex from "./encoding/hex.js";

const derPrefix = "302a300506032b6570032100";
const derPrefixBytes = hex.decode(derPrefix);

/**
 * An public key on the Hedera™ network.
 */
export default class PublicKey extends Key {
    /**
     * @internal
     * @hideconstructor
     * @param {Uint8Array} keyData
     */
    constructor(keyData) {
        super();

        /**
         * @type {Uint8Array}
         * @private
         * @readonly
         */
        this._keyData = keyData;
    }

    /**
     * @param {Uint8Array} data
     * @returns {PublicKey}
     */
    static fromBytes(data) {
        switch (data.length) {
            case 32:
                return new PublicKey(data);

            case 48:
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                if (arrayStartsWith(data, derPrefixBytes)) {
                    return new PublicKey(data.subarray(12));
                }

                break;

            default:
        }

        throw new BadKeyError(
            `invalid public key length: ${data.length} bytes`
        );
    }

    /**
     * Parse a public key from a string of hexadecimal digits.
     *
     * The public key may optionally be prefixed with
     * the DER header.
     *
     * @param {string} text
     * @returns {PublicKey}
     */
    static fromString(text) {
        return PublicKey.fromBytes(hex.decode(text));
    }

    /**
     * Verify a signature on a message with this public key.
     *
     * @param {Uint8Array} message
     * @param {Uint8Array} signature
     * @returns {boolean}
     */
    verify(message, signature) {
        return nacl.sign.detached.verify(message, signature, this._keyData);
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return this._keyData.slice();
    }

    /**
     * @returns {string}
     */
    toString() {
        return derPrefix + hex.encode(this._keyData);
    }

    /**
     * @param {PublicKey} other
     * @returns {boolean}
     */
    equals(other) {
        return arrayEqual(this._keyData, other._keyData);
    }
}
