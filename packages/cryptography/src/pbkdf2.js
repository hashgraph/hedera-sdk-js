import { HashAlgorithm } from "./hmac.js";
import * as utf8 from "./utf8.js";
import * as crypto from "crypto";
import { promisify } from "util";

export const pbkdf2 = promisify(crypto.pbkdf2);

/**
 * @param {HashAlgorithm} algorithm
 * @param {Uint8Array | string} password
 * @param {Uint8Array | string} salt
 * @param {number} iterations
 * @param {number} length
 * @returns {Promise<Uint8Array>}
 */
async function deriveKey(algorithm, password, salt, iterations, length) {
    const pass = typeof password === "string" ?
    // Valid ASCII is also valid UTF-8 so encoding the password as UTF-8
    // should be fine if only valid ASCII characters are used in the password
        utf8.encode(password) :
        password;

    const nacl = typeof salt === "string" ?
        utf8.encode(salt) :
        salt;

    if (typeof global.globalThis.Buffer === "undefined") {
        try {
            const key = await global.window.crypto.subtle.importKey("raw", pass, {
                name: "PBKDF2",
                hash: algorithm
            }, false, [ "deriveBits" ]);

            return new Uint8Array(await global.window.crypto.subtle.deriveBits({
                name: "PBKDF2",
                hash: algorithm,
                salt: nacl,
                iterations
            }, key, length << 3));
        } catch {
            switch (algorithm) {
                case HashAlgorithm.Sha256:
                    return pbkdf2(pass, nacl, iterations, length, HashAlgorithm.Sha256);
                case HashAlgorithm.Sha384:
                    return pbkdf2(pass, nacl, iterations, length, HashAlgorithm.Sha384);
                case HashAlgorithm.Sha512:
                    return pbkdf2(pass, nacl, iterations, length, HashAlgorithm.Sha512);
                default: throw new Error("(BUG) Non-Exhaustive switch statement for algorithms");
            }
        }
    }

    switch (algorithm) {
        case HashAlgorithm.Sha256:
            return pbkdf2(password, nacl, iterations, length, "sha256");
        case HashAlgorithm.Sha384:
            return pbkdf2(password, nacl, iterations, length, "sha384");
        case HashAlgorithm.Sha512:
            return pbkdf2(password, nacl, iterations, length, "sha512");
        default: throw new Error("(BUG) Non-Exhaustive switch statement for algorithms");
    }
}
