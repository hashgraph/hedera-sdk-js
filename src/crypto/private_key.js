import nacl from "tweetnacl";

import PublicKey from "./public_key";

/**
 * A private key on the Hedera™ network.
 */
export default class PrivateKey {
    /**
     * @param {Uint8Array} data
     */
    constructor(data) {
        const pair = nacl.sign.keyPair.fromSeed(data.slice(0, 32));

        this._secretKeyData = pair.secretKey;
        this._publicKeyData = pair.publicKey;

        if (data.byteLength === 64) {
            this._chainCode = data.slice(32);
        }
    }

    /**
     * Generate a new Ed25519 private key.
     *
     * @returns {PrivateKey}
     */
    static generate() {
        // 32-bytes for the seed and 32-bytes for the chain code to enable
        // SLIP-10 key derivation
        return new PrivateKey(nacl.randomBytes(64));
    }

    /**
     * Sign a message with this private key.
     *
     * @param {Uint8Array} message
     * @returns {Uint8Array}
     */
    sign(message) {
        return nacl.sign.detached(message, this._secretKeyData);
    }

    /**
     * Return the associated Ed25519 public key for this private key.
     *
     * @returns {PublicKey}
     */
    get publicKey() {
        return new PublicKey(this._publicKeyData);
    }
}
