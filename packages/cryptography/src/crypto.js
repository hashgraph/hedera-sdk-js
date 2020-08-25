import { isAccessible } from "./util.js";

export const CipherAlgorithm = {
    Aes128Ctr: "AES-128-CTR",
};

/**
 * @param {string} algorithm
 * @param {Uint8Array} key
 * @param {Uint8Array} iv
 * @param {Uint8Array} data
 * @returns {Promise<Uint8Array>}
 */
export async function createCipheriv(algorithm, key, iv, data) {
    if (isAccessible("Buffer")) {
        const cipher = (await import("crypto")).createCipheriv(
            algorithm,
            key.slice(0, 16),
            iv
        );

        return Buffer.concat([cipher.update(data), cipher["final"]()]);
    } else {
        const key_ = await window.crypto.subtle.importKey(
            "raw",
            key,
            "AES-CTR",
            false,
            ["encrypt"]
        );

        return new Uint8Array(
            await window.crypto.subtle.encrypt(
                {
                    name: "AES-CTR",
                    counter: iv,
                    length: 128,
                },
                key_,
                data
            )
        );
    }
}

/**
 * @param {string} algorithm
 * @param {Uint8Array} key
 * @param {Uint8Array} iv
 * @param {Uint8Array} data
 * @returns {Promise<Uint8Array>}
 */
export async function createDecipheriv(algorithm, key, iv, data) {
    if (isAccessible("Buffer")) {
        const decipher = (await import("crypto")).createDecipheriv(
            algorithm,
            key.slice(0, 16),
            iv
        );

        return Buffer.concat([decipher.update(data), decipher["final"]()]);
    } else {
        const key_ = await window.crypto.subtle.importKey(
            "raw",
            key,
            "AES-CTR",
            false,
            ["decrypt"]
        );

        return new Uint8Array(
            await window.crypto.subtle.decrypt(
                {
                    name: "AES-CTR",
                    counter: iv,
                    length: 128,
                },
                key_,
                data
            )
        );
    }
}
