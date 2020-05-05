import nacl from "tweetnacl";
import Key from "./key.js";

/**
 * An public key on the Hedera™ network.
 */
export default class PublicKey extends Key {
    /**
     * @param {Uint8Array} data
     */
    constructor(data) {
        super();
        this._publicKeyData = data.slice(0, 32);
    }

    /**
     * Sign a message with this private key.
     *
     * @param {Uint8Array} message
     * @param {Uint8Array} signature
     * @returns {boolean}
     */
    verify(message, signature) {
        return nacl.sign.detached.verify(
            message,
            signature,
            this._publicKeyData
        );
    }

    /**
     * Return the Ed25519 public key; simply `this`.
     *
     * @override
     * @returns {PublicKey}
     */
    // get publicKey() {
    //     return this;
    // }
}
