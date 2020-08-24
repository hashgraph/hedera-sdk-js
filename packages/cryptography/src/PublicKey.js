import nacl from "tweetnacl";
import Key from "./Key.js";
import BadKeyError from "./BadKeyError.js";
import { ED25519PUBLICKEY_PREFIX } from "./util.js";
import * as hex from "./encoding/hex.js";

/**
 * An public key on the Hedera™ network.
 */
export default class PublicKey extends Key {
    /**
     * @param {Uint8Array} data
     */
    constructor(data) {
        super();
        /**
         * @type {Uint8Array}
         */
        this._keyData = data.slice(0, 32);

        /**
         * @type {string | null}
         */
        this._asStringRaw = null;
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {PublicKey}
     */
    static fromBytes(bytes) {
        return new PublicKey(bytes);
    }

    /**
     * @param {string} keyStr
     * @returns {PublicKey}
     */
    static fromString(keyStr) {
        switch (keyStr.length) {
            case 64: {
                // raw public key
                const newKey = new PublicKey(hex.decode(keyStr));
                newKey._asStringRaw = keyStr;
                return newKey;
            }
            case 88: // DER encoded public key
                if (keyStr.startsWith(ED25519PUBLICKEY_PREFIX)) {
                    const rawKey = keyStr.slice(24);
                    const newKey = new PublicKey(hex.decode(rawKey));
                    newKey._asStringRaw = rawKey;
                    return newKey;
                }
                break;
            default:
        }

        throw new BadKeyError(undefined);
    }

    /**
     * Sign a message with this private key.
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
        return ED25519PUBLICKEY_PREFIX + hex.encode(this._keyData);
    }
}
