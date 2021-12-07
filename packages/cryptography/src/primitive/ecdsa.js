import crypto from "crypto";
import { promisify } from "util";

const generateKeyPairAsync = promisify(crypto.generateKeyPair)

/**
 * @typedef {import("../EcdsaPrivateKey.js").KeyPair} KeyPair
 */

const options = {
    namedCurve: "secp256k1",
};

/**
 * @returns {KeyPair}
 */
export function generate() {
    const result = crypto.generateKeyPairSync("ec", options);

    return {
        publicKey: /** @type {Buffer} */ (/** @type {unknown} */ (result.publicKey)),
        privateKey: /** @type {Buffer} */ (/** @type {unknown} */ (result.privateKey)),
    };
}

export async function generateAsync() {
    const result = await generateKeyPairAsync("ec", options);

    return {
        publicKey: result.publicKey.export(),
        privateKey: result.privateKey.export(),
    };
}

/**
 * @param {Uint8Array} data
 * @returns {KeyPair}
 */
export function fromBytesDer(data) {
    const privateKey = crypto
        .createPrivateKey({
            type: "pkcs8",
            key: Buffer.from(data),
        })
        .export();

    const publicKey = crypto.createPublicKey(privateKey).export();

    return {
        publicKey,
        privateKey,
    };
}

/**
 * @param {Uint8Array} data
 * @returns {KeyPair}
 */
export function fromBytesRaw(data) {
    const privateKey = crypto.createPrivateKey(Buffer.from(data)).export();
    const publicKey = crypto.createPublicKey(privateKey).export();

    return {
        publicKey,
        privateKey,
    };
}

/**
 * @param {Uint8Array} keydata
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function sign(keydata, data) {
    const privateKey = crypto.createPrivateKey(Buffer.from(keydata));

    const sign = crypto.createSign('SHA256');
    sign.write(data);
    sign.end();

    return sign.sign(privateKey);
}

/**
 * @param {Uint8Array} keydata
 * @param {Uint8Array} message
 * @param {Uint8Array} signature
 * @returns {boolean}
 */
export function verify(keydata, message, signature) {
    const privateKey = crypto.createPrivateKey(Buffer.from(keydata));
    const publicKey = crypto.createPublicKey(privateKey).export();

    const verify = crypto.createVerify('SHA256');
    verify.write(message);
    verify.end();

    return verify.verify(publicKey, signature);
}
