import { HashAlgorithm } from "./hmac.js";
import * as utf8 from "../encoding/utf8.js";
import util from "util";
import crypto from "crypto";

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

    const pbkdf2 = util.promisify(crypto.pbkdf2);

    switch (algorithm) {
        case HashAlgorithm.Sha256:
            return pbkdf2(pass, nacl, iterations, length, "sha256");
        case HashAlgorithm.Sha384:
            return pbkdf2(pass, nacl, iterations, length, "sha384");
        case HashAlgorithm.Sha512:
            return pbkdf2(pass, nacl, iterations, length, "sha512");
        default:
            throw new Error(
                "(BUG) Non-Exhaustive switch statement for algorithms"
            );
    }
}
