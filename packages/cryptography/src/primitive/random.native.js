import * as Random from "expo-random";

/**
 * @param {number} count
 * @returns {Uint8Array}
 */
export function bytes(count) {
    return Random.getRandomBytes(count);
}

/**
 * @param {number} count
 * @returns {Promise<Uint8Array>}
 */
export function bytesAsync(count) {
    return Random.getRandomBytesAsync(count);
}
