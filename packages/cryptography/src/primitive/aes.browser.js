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
    let algorithm_;

    switch (algorithm) {
        case CipherAlgorithm.Aes128Ctr:
            algorithm_ = {
                name: "AES-CTR",
                counter: iv,
                length: 128,
            };
            break;
        case CipherAlgorithm.Aes128Cbc:
            algorithm_ = {
                name: "AES-CBC",
                length: 128,
            };
            break;
        default:
            throw new Error(
                "(BUG) non-exhaustive switch statement for CipherAlgorithm"
            );
    }

    const key_ = await window.crypto.subtle.importKey(
        "raw",
        key,
        algorithm_.name,
        false,
        ["encrypt"]
    );

    return new Uint8Array(
        await window.crypto.subtle.encrypt(algorithm_, key_, data)
    );
}

/**
 * @param {string} algorithm
 * @param {Uint8Array} key
 * @param {Uint8Array} iv
 * @param {Uint8Array} data
 * @returns {Promise<Uint8Array>}
 */
export async function createDecipheriv(algorithm, key, iv, data) {
    let algorithm_;

    switch (algorithm) {
        case CipherAlgorithm.Aes128Ctr:
            algorithm_ = {
                name: "AES-CTR",
                counter: iv,
                length: 128,
            };
            break;
        case CipherAlgorithm.Aes128Cbc:
            algorithm_ = {
                name: "AES-CBC",
                iv,
            };
            break;
        default:
            throw new Error(
                "(BUG) non-exhaustive switch statement for CipherAlgorithm"
            );
    }

    const key_ = await window.crypto.subtle.importKey(
        "raw",
        key,
        algorithm_.name,
        false,
        ["decrypt"]
    );

    return new Uint8Array(
        await window.crypto.subtle.decrypt(algorithm_, key_, data)
    );
}
