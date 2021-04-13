import nacl from "tweetnacl";

/**
 * @param {number} count
 * @returns {Uint8Array}
 */
export function bytes(count) {
    return nacl.randomBytes(count);
}

/**
 * @param {number} count
 * @returns {Promise<Uint8Array>}
 */
export function bytesAsync(count) {
    return Promise.resolve(nacl.randomBytes(count));
}
