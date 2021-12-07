// import PublicKey from "./PublicKey.js";
// import Mnemonic from "./Mnemonic.js";
// import { arrayStartsWith } from "./util/array.js";
// import { createKeystore, loadKeystore } from "./primitive/keystore.js";
import * as hex from "./encoding/hex.js";
// import { read as readPem } from "./encoding/pem.js";
// import * as slip10 from "./primitive/slip10.js";
// import * as derive from "./util/derive.js";
import * as ecdsa from "./primitive/ecdsa.js";

const derPrefix = "302e020100300506032b657004220420";
// const derPrefixBytes = hex.decode(derPrefix);

/**
 * @typedef {object} KeyPair
 * @property {Uint8Array} publicKey
 * @property {Uint8Array} privateKey
 */

export default class EcdsaPrivateKey {
    /**
     * @hideconstructor
     * @internal
     * @param {KeyPair} keyPair
     * @param {(Uint8Array)=} chainCode
     */
    constructor(keyPair, chainCode) {
        /**
         * @type {KeyPair}
         * @readonly
         * @private
         */
        this._keyPair = keyPair;

        /**
         * @type {?Uint8Array}
         * @readonly
         * @private
         */
        this._chainCode = chainCode != null ? chainCode : null;
    }

    /**
     * Generate a random ECDSA private key.
     *
     * @returns {EcdsaPrivateKey}
     */
    static generate() {
        return new EcdsaPrivateKey(ecdsa.generate());
    }

    /**
     * Generate a random Ed25519 private key.
     *
     * @returns {Promise<EcdsaPrivateKey>}
     */
    static async generateAsync() {
        return new EcdsaPrivateKey(await ecdsa.generateAsync());
    }

    /**
     * Construct a private key from bytes.
     *
     * @param {Uint8Array} data
     * @returns {EcdsaPrivateKey}
     */
    static fromBytes(data) {
        return EcdsaPrivateKey.fromBytesDer(data);
    }

    /**
     * Construct a private key from bytes.
     *
     * @param {Uint8Array} data
     * @returns {EcdsaPrivateKey}
     */
    static fromBytesDer(data) {
        return new EcdsaPrivateKey(ecdsa.fromBytesDer(data));
    }

    /**
     * Construct a private key from bytes.
     *
     * @param {Uint8Array} data
     * @returns {EcdsaPrivateKey}
     */
    static fromBytesRaw(data) {
        return new EcdsaPrivateKey(ecdsa.fromBytesRaw(data));
    }

    /**
     * Construct a private key from a hex-encoded string.
     *
     * @param {string} text
     * @returns {EcdsaPrivateKey}
     */
    static fromString(text) {
        return EcdsaPrivateKey.fromBytes(hex.decode(text));
    }

    // /**
    //  * Recover a private key from a mnemonic phrase (and optionally a password).
    //  *
    //  * @param {Mnemonic | string} mnemonic
    //  * @param {string} [passphrase]
    //  * @returns {Promise<EcdsaPrivateKey>}
    //  */
    // static async fromMnemonic(mnemonic, passphrase = "") {
    //     return (
    //         typeof mnemonic === "string"
    //             ? await Mnemonic.fromString(mnemonic)
    //             : mnemonic
    //     ).toEcdsaPrivateKey(passphrase);
    // }

    // /**
    //  * Recover a private key from a keystore, previously created by `.toKeystore()`.
    //  *
    //  * This key will _not_ support child key derivation.
    //  *
    //  * @param {Uint8Array} data
    //  * @param {string} [passphrase]
    //  * @returns {Promise<EcdsaPrivateKey>}
    //  * @throws {BadKeyError} If the passphrase is incorrect or the hash fails to validate.
    //  */
    // static async fromKeystore(data, passphrase = "") {
    //     return EcdsaPrivateKey.fromBytes(await loadKeystore(data, passphrase));
    // }

    // /**
    //  * Recover a private key from a pem string; the private key may be encrypted.
    //  *
    //  * This method assumes the .pem file has been converted to a string already.
    //  *
    //  * If `passphrase` is not null or empty, this looks for the first `ENCRYPTED PRIVATE KEY`
    //  * section and uses `passphrase` to decrypt it; otherwise, it looks for the first `PRIVATE KEY`
    //  * section and decodes that as a DER-encoded  private key.
    //  *
    //  * @param {string} data
    //  * @param {string} [passphrase]
    //  * @returns {Promise<EcdsaPrivateKey>}
    //  */
    // static async fromPem(data, passphrase = "") {
    //     return new EcdsaPrivateKey(await readPem(data, passphrase), null);
    // }

    // /**
    //  * Derive a new private key at the given wallet index.
    //  *
    //  * Only currently supported for keys created with `fromMnemonic()`; other keys will throw
    //  * an error.
    //  *
    //  * You can check if a key supports derivation with `.supportsDerivation()`
    //  *
    //  * @param {number} index
    //  * @returns {Promise<EcdsaPrivateKey>}
    //  * @throws If this key does not support derivation.
    //  */
    // async derive(index) {
    //     if (this._chainCode == null) {
    //         throw new Error("this private key does not support key derivation");
    //     }
    //
    //     const { keyData, chainCode } = await slip10.derive(
    //         this.toBytes(),
    //         this._chainCode,
    //         index
    //     );
    //
    //     const keyPair = nacl.sign.keyPair.fromSeed(keyData);
    //
    //     return new EcdsaPrivateKey(keyPair, chainCode);
    // }

    // /**
    //  * Get the public key associated with this private key.
    //  *
    //  * The public key can be freely given and used by other parties to verify
    //  * the signatures generated by this private key.
    //  *
    //  * @returns {EcdsaPublicKey}
    //  */
    // get publicKey() {
    //     return new PublicKey(this._keyPair.publicKey);
    // }

    /**
     * Sign a message with this private key.
     *
     * @param {Uint8Array} bytes
     * @returns {Uint8Array} - The signature bytes without the message
     */
    sign(bytes) {
        return ecdsa.sign(this._keyPair.privateKey, bytes);
    }

    /**
     * Check if `derive` can be called on this private key.
     *
     * This is only the case if the key was created from a mnemonic.
     *
     * @returns {boolean}
     */
    isDerivable() {
        throw new Error("not implemented");
    }
    
    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        // copy the bytes so they can't be modified accidentally
        return this._keyPair.privateKey.slice(0, 32);
    }

    /**
     * @returns {string}
     */
    toString() {
        return derPrefix + hex.encode(this.toBytes());
    }
}
