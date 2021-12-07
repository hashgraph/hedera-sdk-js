/**
 * @typedef {import("../EcdsaPrivateKey.js").KeyPair} KeyPair
 */

/**
 * @returns {KeyPair}
 */
export function generate() {
    throw new Error("not implemented");
}

/**
 * @returns {Promise<KeyPair>}
 */
export async function generateAsync() {
    throw new Error("not implemented");
}

/**
 * @param {Uint8Array} data
 * @returns {KeyPair}
 */
export function fromBytes(data) {
    throw new Error("not implemented");
}

/**
 * @param {Uint8Array} keydata
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function sign(keydata, data) {
    throw new Error("not implemented");
}

/**
 * @param {Uint8Array} keydata
 * @param {Uint8Array} message
 * @param {Uint8Array} signature
 * @returns {boolean}
 */
export function verify(keydata, message, signature) {
    throw new Error("not implemented");
}
