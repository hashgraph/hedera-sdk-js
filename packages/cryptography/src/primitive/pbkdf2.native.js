import { HashAlgorithm } from "./hmac.js";
import * as utf8 from "../encoding/utf8.js";
import * as hex from "../encoding/hex.js";
import CryptoJS from "crypto-js";

/**
 * @param {HashAlgorithm} algorithm
 * @param {Uint8Array | string} password
 * @param {Uint8Array | string} salt
 * @param {number} iterations
 * @param {number} length
 * @returns {Promise<Uint8Array>}
 */
export async function deriveKey(algorithm, password, salt, iterations, length) {
    const pass =
        typeof password === "string"
            ? // Valid ASCII is also valid UTF-8 so encoding the password as UTF-8
              // should be fine if only valid ASCII characters are used in the password
              utf8.encode(password)
            : password;

    const nacl = typeof salt === "string" ? utf8.encode(salt) : salt;

    const password_ = CryptoJS.enc.Hex.parse(hex.encode(pass));
    const nacl_ = CryptoJS.enc.Hex.parse(hex.encode(nacl));

    let hasher;
    switch (algorithm) {
        case HashAlgorithm.Sha256:
            hasher = CryptoJS.algo.SHA256;
            break;
        case HashAlgorithm.Sha384:
            hasher = CryptoJS.algo.SHA384;
            break;
        case HashAlgorithm.Sha512:
            hasher = CryptoJS.algo.SHA512;
            break;
        default:
            throw new Error(
                "(BUG) Non-Exhaustive switch statement for algorithms",
            );
    }

    const cfg = {
        keySize: length / 4,
        hasher,
        iterations,
    };

    return Promise.resolve(
        hex.decode(
            CryptoJS.PBKDF2(password_, nacl_, cfg).toString(CryptoJS.enc.Hex),
        ),
    );
}
