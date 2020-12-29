import crypto from "crypto";
import * as utf8 from "../encoding/utf8.js";

/**
 * @enum {string}
 */
export const HashAlgorithm = {
    Sha256: "SHA-256",
    Sha384: "SHA-384",
    Sha512: "SHA-512",
};

/**
 * @param {HashAlgorithm} algorithm
 * @param {Uint8Array | string} secretKey
 * @param {Uint8Array | string} data
 * @returns {Promise<Uint8Array>}
 */
export function hash(algorithm, secretKey, data) {
    const key =
        typeof secretKey === "string" ? utf8.encode(secretKey) : secretKey;
    const value = typeof data === "string" ? utf8.encode(data) : data;

    switch (algorithm) {
        case HashAlgorithm.Sha256:
            return Promise.resolve(
                crypto.createHmac("SHA256", key).update(value).digest()
            );
        case HashAlgorithm.Sha384:
            return Promise.resolve(
                crypto.createHmac("SHA384", key).update(value).digest()
            );
        case HashAlgorithm.Sha512:
            return Promise.resolve(
                crypto.createHmac("SHA512", key).update(value).digest()
            );
        default:
            throw new Error(
                "(BUG) Non-Exhaustive switch statement for algorithms"
            );
    }
}
