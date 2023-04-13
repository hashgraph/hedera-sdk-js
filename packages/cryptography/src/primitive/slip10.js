import * as hmac from "../primitive/hmac.js";
import * as bip32 from "../primitive/bip32.js";

/**
 * @param {Uint8Array} parentKey
 * @param {Uint8Array} chainCode
 * @param {number} index
 * @returns {Promise<{ keyData: Uint8Array; chainCode: Uint8Array }>}
 */
export async function derive(parentKey, chainCode, index) {
    if (bip32.isHardenedIndex(index)) {
        throw new Error("the index should not be pre-hardened");
    }

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

    return { keyData: digest.subarray(0, 32), chainCode: digest.subarray(32) };
}

/**
 * @param {Uint8Array} seed
 * @returns {Promise<{ keyData: Uint8Array; chainCode: Uint8Array }>}
 */
export async function fromSeed(seed) {
    const digest = await hmac.hash(
        hmac.HashAlgorithm.Sha512,
        "ed25519 seed",
        seed
    );

    return { keyData: digest.subarray(0, 32), chainCode: digest.subarray(32) };
}
