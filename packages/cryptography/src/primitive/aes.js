export const CipherAlgorithm = {
    Aes128Ctr: "AES-128-CTR",
    Aes128Cbc: "AES-128-CBC",
};

/**
 * @param {string} algorithm
 * @param {Uint8Array} key
 * @param {Uint8Array} iv
 * @param {Uint8Array} data
 * @returns {Promise<Uint8Array>}
 */
export async function createCipheriv(algorithm, key, iv, data) {
    const cipher = (await import("crypto")).createCipheriv(
        algorithm,
        key.slice(0, 16),
        iv
    );

    return Buffer.concat([cipher.update(data), cipher["final"]()]);
}

/**
 * @param {string} algorithm
 * @param {Uint8Array} key
 * @param {Uint8Array} iv
 * @param {Uint8Array} data
 * @returns {Promise<Uint8Array>}
 */
export async function createDecipheriv(algorithm, key, iv, data) {
    const decipher = (await import("crypto")).createDecipheriv(
        algorithm,
        key.slice(0, 16),
        iv
    );

    return Buffer.concat([decipher.update(data), decipher["final"]()]);
}
