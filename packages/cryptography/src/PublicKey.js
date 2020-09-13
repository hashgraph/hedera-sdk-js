import nacl from "tweetnacl";
import Key from "./Key.js";
import { arraysEqual } from "./util";
import BadKeyError from "./BadKeyError.js";
import * as hex from "./encoding/hex.js";

const derPrefix = "302a300506032b6570032100";
const derPrefixBytes = hex.decode(derPrefix);

/**
 * An public key on the Hedera™ network.
 */
export default class PublicKey extends Key {
    /**
     * @private
     * @hideconstructor
     * @param {Uint8Array} keyData
     */
    constructor(keyData) {
        super();

        this._keyData = keyData;
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {PublicKey}
     */
    static fromBytes(bytes) {
        switch (bytes.length) {
            case 32:
                return new PublicKey(bytes);

            case 48:
                if (arraysEqual(bytes.subarray(0, 12), derPrefixBytes)) {
                    return new PublicKey(bytes.subarray(12));
                }

                break;

            default:
        }

        throw new BadKeyError(
            `invalid public key length: ${bytes.length} bytes`
        );
    }

    /**
     * @param {string} publicKey
     * @returns {PublicKey}
     */
    static fromString(publicKey) {
        return PublicKey.fromBytes(hex.decode(publicKey));
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
     * @param {boolean} [raw]
     * @returns {string}
     */
    toString(raw = false) {
        return (raw ? "" : derPrefix) + hex.encode(this._keyData);
    }

    /**
     * @param {PublicKey} other
     * @returns {boolean}
     */
    equals(other) {
        return arraysEqual(this._keyData, other._keyData);
    }
}
