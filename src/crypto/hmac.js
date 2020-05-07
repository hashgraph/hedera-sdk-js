import * as crypto from "crypto";
import utf8 from "../encoding/utf8";
import { hmac as stableHmac } from "@stablelib/hmac";
import { SHA512 } from "@stablelib/sha512";
import { SHA384 } from "@stablelib/sha384";
import { SHA256 } from "@stablelib/sha256";

/**
 * @type {object.<string, string>}
 */
export const HashAlgorithm = {
    Sha256: "SHA-256",
    Sha384: "SHA-384",
    Sha512: "SHA-512",
};

export const HashAlgorithmKeys = Object.keys(HashAlgorithm);

/**
 * @param {string} algorithm
 * @param {Uint8Array | string} secretKey
 * @param {Uint8Array | string} data
 * @returns {Promise<Uint8Array>}
 */
export default async function hmac(algorithm, secretKey, data) {
    const key =
        typeof secretKey === "string" ? utf8.encode(secretKey) : secretKey;
    const value = typeof data === "string" ? utf8.encode(data) : data;

    if (!HashAlgorithmKeys.includes(algorithm)) {
        throw new Error("Unsupported algorithm");
    }

    algorithm = HashAlgorithm[algorithm];

    if (typeof window !== "undefined" && window != null) {
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
            switch (algorithm) {
                case HashAlgorithm.Sha256:
                    return stableHmac(SHA256, key, value);
                case HashAlgorithm.Sha384:
                    return stableHmac(SHA384, key, value);
                case HashAlgorithm.Sha512:
                    return stableHmac(SHA512, key, value);
                default:
                    throw new Error(
                        "(BUG) Non-Exhaustive switch statement for algorithms"
                    );
            }
        }
    }

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
