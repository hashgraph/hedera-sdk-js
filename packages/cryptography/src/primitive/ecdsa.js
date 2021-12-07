import crypto from "crypto";
import { promisify } from "util";

const generateKeyPairAsync = promisify(crypto.generateKeyPair);

/**
 * @typedef {import("../EcdsaPrivateKey.js").KeyPair} KeyPair
 */

const createOptions = {
    namedCurve: "secp256k1",
};

/** @type {crypto.KeyExportOptions<"der">} */
const privateKeyExportOptions = { type: "pkcs8", format: "der" };

/** @type {crypto.KeyExportOptions<"der">} */
const publicKeyExportOptions = { type: "spki", format: "der" };

/**
 * @returns {KeyPair}
 */
export function generate() {
    const result = crypto.generateKeyPairSync("ec", createOptions);

    return {
        privateKey: result.privateKey.export(privateKeyExportOptions),
        publicKey: result.publicKey.export(publicKeyExportOptions),
    };
}

/**
 * @returns {Promise<KeyPair>}
 */
export async function generateAsync() {
    const result = await generateKeyPairAsync("ec", createOptions);

    return {
        privateKey: result.privateKey.export(privateKeyExportOptions),
        publicKey: result.publicKey.export(publicKeyExportOptions),
    };
}

/**
 * @param {Uint8Array} data
 * @returns {KeyPair}
 */
export function fromBytes(data) {
    const privateKey = crypto.createPrivateKey({
        type: "pkcs8",
        format: "der",
        key: Buffer.from(data),
    });
    const publicKey = crypto
        .createPublicKey(privateKey)
        .export(publicKeyExportOptions);

    return {
        privateKey: privateKey.export(privateKeyExportOptions),
        publicKey,
    };
}

/**
 * @param {Uint8Array} keydata
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function sign(keydata, data) {
    const privateKey = crypto.createPrivateKey({
        type: "pkcs8",
        format: "der",
        key: Buffer.from(keydata),
    });

    const sign = crypto.createSign("SHA256");
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
    const publicKey = crypto.createPublicKey({
        type: "spki",
        format: "der",
        key: Buffer.from(keydata),
    });

    const verify = crypto.createVerify("SHA256");
    verify.write(message);
    verify.end();

    return verify.verify(publicKey, signature);
}
