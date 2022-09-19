import Key from "./Key.js";
import BadKeyError from "./BadKeyError.js";
import { arrayEqual, arrayStartsWith } from "./util/array.js";
import * as hex from "./encoding/hex.js";
import * as ecdsa from "./primitive/ecdsa.js";
import { keccak256 } from "./primitive/keccak.js";

const derPrefix = "302d300706052b8104000a032200";
const derPrefixBytes = hex.decode(derPrefix);

/**
 * An public key on the Hedera™ network.
 */
export default class EcdsaPublicKey extends Key {
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
     * @returns {string}
     */
    get _type() {
        return "secp256k1";
    }

    /**
     * @param {Uint8Array} data
     * @returns {EcdsaPublicKey}
     */
    static fromBytes(data) {
        switch (data.length) {
            case 33:
                return EcdsaPublicKey.fromBytesRaw(data);
            case 47:
                return EcdsaPublicKey.fromBytesDer(data);
            default:
                throw new BadKeyError(
                    `invalid public key length: ${data.length} bytes`
                );
        }
    }

    /**
     * @param {Uint8Array} data
     * @returns {EcdsaPublicKey}
     */
    static fromBytesDer(data) {
        if (data.length != 47 || !arrayStartsWith(data, derPrefixBytes)) {
            throw new BadKeyError(
                `invalid public key length: ${data.length} bytes`
            );
        }

        return new EcdsaPublicKey(data.subarray(derPrefixBytes.length));
    }

    /**
     * @param {Uint8Array} data
     * @returns {EcdsaPublicKey}
     */
    static fromBytesRaw(data) {
        if (data.length != 33) {
            throw new BadKeyError(
                `invalid public key length: ${data.length} bytes`
            );
        }

        return new EcdsaPublicKey(data);
    }

    /**
     * Parse a public key from a string of hexadecimal digits.
     *
     * The public key may optionally be prefixed with
     * the DER header.
     *
     * @param {string} text
     * @returns {EcdsaPublicKey}
     */
    static fromString(text) {
        return EcdsaPublicKey.fromBytes(hex.decode(text));
    }

    /**
     * Verify a signature on a message with this public key.
     *
     * @param {Uint8Array} message
     * @param {Uint8Array} signature
     * @returns {boolean}
     */
    verify(message, signature) {
        return ecdsa.verify(this._keyData, message, signature);
    }

    /**
     * @returns {Uint8Array}
     */
    toBytesDer() {
        const bytes = new Uint8Array(
            derPrefixBytes.length + this._keyData.length
        );

        bytes.set(derPrefixBytes, 0);
        bytes.set(this._keyData, derPrefixBytes.length);

        return bytes;
    }

    /**
     * @returns {Uint8Array}
     */
    toBytesRaw() {
        return new Uint8Array(this._keyData.subarray());
    }

    /**
     * @returns {string}
     */
    toEthereumAddress() {
        const hash = hex.decode(
            keccak256(
                `0x${hex.encode(
                    ecdsa.getFullPublicKey(this.toBytesRaw()).subarray(1)
                )}`
            )
        );
        return hex.encode(hash.subarray(12));
    }

    /**
     * @param {EcdsaPublicKey} other
     * @returns {boolean}
     */
    equals(other) {
        return arrayEqual(this._keyData, other._keyData);
    }
}
