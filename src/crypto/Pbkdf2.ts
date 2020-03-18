import { HashAlgorithm } from "./Hmac";
import { SHA256 } from "@stablelib/sha256";
import { SHA384 } from "@stablelib/sha384";
import { SHA512 } from "@stablelib/sha512";
import { deriveKey } from "@stablelib/pbkdf2";
import * as utf8 from "@stablelib/utf8";
import * as crypto from "crypto";
import { promisify } from "util";

export const pbkdf2 = promisify(crypto.pbkdf2);

export class Pbkdf2 {
    public static async deriveKey(
        algorithm: HashAlgorithm,
        password: Uint8Array | string,
        salt: Uint8Array | string,
        iterations: number,
        length: number
    ): Promise<Uint8Array> {
        const pass = typeof password === "string" ?
        // Valid ASCII is also valid UTF-8 so encoding the password as UTF-8
        // should be fine if only valid ASCII characters are used in the password
            utf8.encode(password) :
            password;

        const nacl = typeof salt === "string" ?
            utf8.encode(salt) :
            salt;

        if (typeof window !== "undefined" && window != null) {
            try {
                const key = await window.crypto.subtle.importKey("raw", pass, {
                    name: "PBKDF2",
                    hash: algorithm
                }, false, [ "deriveBits" ]);

                return new Uint8Array(await window.crypto.subtle.deriveBits({
                    name: "PBKDF2",
                    hash: algorithm,
                    salt: nacl,
                    iterations
                }, key, length << 3));
            } catch {
                switch (algorithm) {
                    case HashAlgorithm.Sha256:
                        return deriveKey(SHA256, pass, nacl, iterations, length);
                    case HashAlgorithm.Sha384:
                        return deriveKey(SHA384, pass, nacl, iterations, length);
                    case HashAlgorithm.Sha512:
                        return deriveKey(SHA512, pass, nacl, iterations, length);
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
}
