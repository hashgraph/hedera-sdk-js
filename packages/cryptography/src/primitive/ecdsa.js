import { keccak256 } from "./keccak.js";
import * as hex from "../encoding/hex.js";
import * as random from "../primitive/random.js";
import * as secp256k1 from "tiny-secp256k1";

/**
 * @typedef {import("../EcdsaPrivateKey.js").KeyPair} KeyPair
 */

/**
 * @returns {KeyPair}
 */
export function generate() {
    for (let attempt = 0; attempt < 30; attempt++) {
        const privateKey = random.bytes(32);
        const publicKey = secp256k1.pointFromScalar(privateKey, true);

        if (!secp256k1.isPrivate(privateKey) || publicKey == null) {
            continue;
        }

        return {
            privateKey,
            publicKey,
        };
    }

    throw new Error(`Couldn't generate valid data.`);
}

/**
 * @returns {Promise<KeyPair>}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateAsync() {
    for (let attempt = 0; attempt < 30; attempt++) {
        const privateKey = await random.bytesAsync(32);
        const publicKey = secp256k1.pointFromScalar(privateKey, true);

        if (!secp256k1.isPrivate(privateKey) || publicKey == null) {
            continue;
        }

        return {
            privateKey,
            publicKey,
        };
    }

    throw new Error(`Couldn't generate valid data.`);
}

/**
 * @param {Uint8Array} data
 * @returns {KeyPair}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function fromBytes(data) {
    const publicKey = secp256k1.pointFromScalar(data, true);

    if (!secp256k1.isPrivate(data) || publicKey == null) {
        throw new Error("failed to decode private key from bytes");
    }

    return {
        privateKey: data,
        publicKey,
    };
}

/**
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getFullPublicKey(data) {
    const publicKey = secp256k1.pointFromScalar(data, true);

    if (!secp256k1.isPrivate(data) || publicKey == null) {
        throw new Error("failed to decode private key from bytes");
    }

    return publicKey;
}

/**
 * @param {Uint8Array} keydata
 * @param {Uint8Array} message
 * @returns {Uint8Array}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function sign(keydata, message) {
    const msg = hex.encode(message);
    const data = hex.decode(keccak256(`0x${msg}`));

    if (!secp256k1.isPrivate(keydata)) {
        throw new Error("failed to decode private key from bytes");
    }

    return secp256k1.sign(data, keydata);
}

/**
 * @param {Uint8Array} keydata
 * @param {Uint8Array} message
 * @param {Uint8Array} signature
 * @returns {boolean}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function verify(keydata, message, signature) {
    const msg = hex.encode(message);
    const data = hex.decode(keccak256(`0x${msg}`));
    return secp256k1.verify(data, keydata, signature);
}
