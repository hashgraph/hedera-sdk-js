import { HashAlgorithm, HashAlgorithmKeys } from "./hmac";
import { SHA256 } from "@stablelib/sha256";
import { SHA384 } from "@stablelib/sha384";
import { SHA512 } from "@stablelib/sha512";
import { deriveKey } from "@stablelib/pbkdf2";
import utf8 from "../encoding/utf8";
import * as crypto from "crypto";
import { promisify } from "util";

export const cryptoPbkdf2 = promisify(crypto.pbkdf2);

/**
 * @param {string} algorithm
 * @param {Uint8Array | string} password
 * @param {Uint8Array | string} salt
 * @param {number} iterations
 * @param {number} length
 * @returns {Promise<Uint8Array>}
 */
export async function pbkdf2(algorithm, password, salt, iterations, length) {
    const pass =
        typeof password === "string"
            ? // Valid ASCII is also valid UTF-8 so encoding the password as UTF-8
              // should be fine if only valid ASCII characters are used in the password
              utf8.encode(password)
            : password;

    if (!HashAlgorithmKeys.includes(algorithm)) {
        throw new Error("Unsupported algorithm");
    }

    algorithm = HashAlgorithm[algorithm];

    const nacl = typeof salt === "string" ? utf8.encode(salt) : salt;

    if (typeof window !== "undefined" && window != null) {
        try {
            const key = await window.crypto.subtle.importKey(
                "raw",
                pass,
                {
                    name: "PBKDF2",
                    hash: algorithm,
                },
                false,
                ["deriveBits"]
            );

            return new Uint8Array(
                await window.crypto.subtle.deriveBits(
                    {
                        name: "PBKDF2",
                        hash: algorithm,
                        salt: nacl,
                        iterations,
                    },
                    key,
                    length << 3
                )
            );
        } catch {
            switch (algorithm) {
                case HashAlgorithm.Sha256:
                    return deriveKey(SHA256, pass, nacl, iterations, length);
                case HashAlgorithm.Sha384:
                    return deriveKey(SHA384, pass, nacl, iterations, length);
                case HashAlgorithm.Sha512:
                    return deriveKey(SHA512, pass, nacl, iterations, length);
                default:
                    throw new Error(
                        "(BUG) Non-Exhaustive switch statement for algorithms"
                    );
            }
        }
    }

    switch (algorithm) {
        case HashAlgorithm.Sha256:
            return cryptoPbkdf2(password, nacl, iterations, length, "sha256");
        case HashAlgorithm.Sha384:
            return cryptoPbkdf2(password, nacl, iterations, length, "sha384");
        case HashAlgorithm.Sha512:
            return cryptoPbkdf2(password, nacl, iterations, length, "sha512");
        default:
            throw new Error(
                "(BUG) Non-Exhaustive switch statement for algorithms"
            );
    }
}
