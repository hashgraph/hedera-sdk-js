import * as hmac from "../primitive/hmac.js";
import * as ecdsa from "../primitive/ecdsa.js";

/**
 * @param {Uint8Array} parentKey
 * @param {Uint8Array} chainCode
 * @param {number} index
 * @returns {Promise<{ keyData: Uint8Array; chainCode: Uint8Array }>}
 */
export async function derive(parentKey, chainCode, index) {
    const input = new Uint8Array(37);

    // 0x00 + parentKey + index(BE)
    input[0] = 0;
    input.set(parentKey, 1);
    new DataView(input.buffer, input.byteOffset, input.byteLength).setUint32(
        33,
        index,
        false
    );

    // set the index to hardened
    input[33] |= 128;

    const digest = await hmac.hash(hmac.HashAlgorithm.Sha512, chainCode, input);

    // Check if keyData is a valid ecdsa key, if so return, otherwise return derive(index + 1)
    const keyData = digest.subarray(0, 32);

    try {
        ecdsa.fromBytes(keyData);
    } catch (_) {
        return derive(parentKey, chainCode, index + 1);
    }

    return { keyData, chainCode: digest.subarray(32) };
}
