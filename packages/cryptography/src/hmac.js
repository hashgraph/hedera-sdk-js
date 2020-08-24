import * as utf8 from "./utf8.js";
import { isAccessible } from "./util.js";

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
export async function hash(algorithm, secretKey, data) {
    const key =
        typeof secretKey === "string" ? utf8.encode(secretKey) : secretKey;
    const value = typeof data === "string" ? utf8.encode(data) : data;

    if (!isAccessible("Buffer")) {
        // Try SubtleCrypto if it exists, otherwise fallback to @stablelibs/Hmac
        try {
            const key_ = await window.crypto.subtle.importKey(
                "raw",
                key,
                {
                    name: "HMAC",
                    hash: algorithm,
                },
                false,
                ["sign"]
            );

            return new Uint8Array(
                await window.crypto.subtle.sign("HMAC", key_, value)
            );
        } catch {
            throw new Error(
                "Fallback if SubtleCrypto fails is not implemented"
            );
        }
    }

    const crypto = await import("crypto");

    switch (algorithm) {
        case HashAlgorithm.Sha256:
            return crypto.createHmac("SHA256", key).update(value).digest();
        case HashAlgorithm.Sha384:
            return crypto.createHmac("SHA384", key).update(value).digest();
        case HashAlgorithm.Sha512:
            return crypto.createHmac("SHA512", key).update(value).digest();
        default:
            throw new Error(
                "(BUG) Non-Exhaustive switch statement for algorithms"
            );
    }
}
