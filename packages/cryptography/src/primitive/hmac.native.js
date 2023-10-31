import CryptoJS from "crypto-js";
import * as utf8 from "../encoding/utf8.js";
import * as hex from "../encoding/hex.js";

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

    const key_ = CryptoJS.enc.Hex.parse(hex.encode(key));
    const value_ = CryptoJS.enc.Hex.parse(hex.encode(value));

    switch (algorithm) {
        case HashAlgorithm.Sha256:
            return Promise.resolve(
                hex.decode(
                    CryptoJS.HmacSHA256(value_, key_).toString(
                        CryptoJS.enc.Hex,
                    ),
                ),
            );
        case HashAlgorithm.Sha384:
            return Promise.resolve(
                hex.decode(
                    CryptoJS.HmacSHA384(value_, key_).toString(
                        CryptoJS.enc.Hex,
                    ),
                ),
            );
        case HashAlgorithm.Sha512:
            return Promise.resolve(
                hex.decode(
                    CryptoJS.HmacSHA512(value_, key_).toString(
                        CryptoJS.enc.Hex,
                    ),
                ),
            );
        default:
            throw new Error(
                "(BUG) Non-Exhaustive switch statement for algorithms",
            );
    }
}
