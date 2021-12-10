import BadKeyError from "../BadKeyError.js";
import { keccak256 } from "./keccak.js";
import * as secp256k1 from "secp256k1";
import * as random from "./random.js";

/**
 * @typedef {import("../EcdsaPrivateKey.js").KeyPair} KeyPair
 */

/**
 * @returns {KeyPair}
 */
export function generate() {
    let privateKey;

    do {
        privateKey = random.bytes(32);
    } while (!secp256k1.privateKeyVerify(privateKey));

    const publicKey = secp256k1.publicKeyCreate(privateKey);

    return {
        privateKey,
        publicKey,
    };
}

/**
 * @returns {Promise<KeyPair>}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateAsync() {
    let privateKey;

    do {
        privateKey = await random.bytesAsync(32);
    } while (!secp256k1.privateKeyVerify(privateKey));

    const publicKey = secp256k1.publicKeyCreate(privateKey);

    return {
        privateKey,
        publicKey,
    };
}

/**
 * @param {Uint8Array} data
 * @returns {KeyPair}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function fromBytes(data) {
    if (!secp256k1.privateKeyVerify(data)) {
        throw new BadKeyError("invalid private key bytes");
    }

    const publicKey = secp256k1.publicKeyCreate(data);

    return {
        privateKey: data,
        publicKey,
    };
}

/**
 * @param {Uint8Array} keydata
 * @param {Uint8Array} message
 * @returns {Uint8Array}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function sign(keydata, message) {
    const data = keccak256(message);
    return secp256k1.ecdsaSign(data, keydata).signature;
}

/**
 * @param {Uint8Array} keydata
 * @param {Uint8Array} message
 * @param {Uint8Array} signature
 * @returns {boolean}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function verify(keydata, message, signature) {
    const data = keccak256(message);
    return secp256k1.ecdsaVerify(signature, data, keydata);
}
