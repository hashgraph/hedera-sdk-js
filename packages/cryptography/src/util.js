import * as hmac from "./hmac.js";

// we could go through the whole BS of producing a DER-encoded structure but it's quite simple
// for Ed25519 keys and we don't have to shell out to a potentially broken lib
// https://github.com/PeculiarVentures/pvutils/issues/8
export const ED25519PRIVATEKEY_PREFIX = "302e020100300506032b657004220420";
export const ED25519PUBLICKEY_PREFIX = "302a300506032b6570032100";

export const HMAC_ALGORITHM = "sha384";

/**
 * SLIP-10/BIP-32 child key derivation
 *
 * @param {Uint8Array} parentKey
 * @param {Uint8Array} chainCode
 * @param {number} index
 * @returns {Promise<{ keyBytes: Uint8Array; chainCode: Uint8Array }>}
 */
export async function deriveChildKey(parentKey, chainCode, index) {
    // webpack version of crypto complains if input types are not `Buffer`
    const input = new Uint8Array(37);
    // 0x00 + parentKey + index(BE)
    input[0] = 0;
    input.set(parentKey, 1);
    new DataView(input.buffer).setUint32(33, index, false);
    // set the index to hardened
    input[33] |= 128;

    const digest = await hmac.hash(hmac.HashAlgorithm.Sha512, chainCode, input);

    return { keyBytes: digest.subarray(0, 32), chainCode: digest.subarray(32) };
}

/**
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {boolean}
 */
export function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (const [i, element] of a.entries()) {
        if (element !== b[i]) return false;
    }
    return true;
}

/**
 * @param {string} prop
 * @returns {boolean}
 */
export function isAccessible(prop) {
    if (typeof self !== "undefined") {
        return prop in self;
    }
    if (typeof window !== "undefined") {
        return prop in window;
    }
    if (typeof global !== "undefined") {
        return prop in global;
    }
    throw new Error("unable to locate global object");
}
