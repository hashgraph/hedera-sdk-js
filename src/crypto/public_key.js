import nacl from "tweetnacl";

export default class PublicKey {
    /**
     * @param {Uint8Array} data
     */
    constructor(data) {
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
}
