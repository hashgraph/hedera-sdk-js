import { HashAlgorithm } from "./Hmac";
import { SHA384 } from "@stablelib/sha384";
import { SHA512 } from "@stablelib/sha512";
import { pbkdf2 } from "./util";
import { deriveKey } from "@stablelib/pbkdf2";

export class Pbkdf2 {
    public async deriveKey(
        algorithm: HashAlgorithm,
        password: Uint8Array,
        salt: Uint8Array,
        iterations: number,
        length: number
    ): Promise<Uint8Array> {
        if (typeof window !== "undefined" && window != null) {
            try {
                const key = await window.crypto.subtle.importKey("raw", password, {
                    name: "PBKDF2",
                    hash: algorithm
                }, false, [ "deriveBits" ]);

                return new Uint8Array(await window.crypto.subtle.deriveBits({
                    name: "PBKDF2",
                    hash: algorithm,
                    salt,
                    iterations
                }, key, length << 3));
            } catch {
                switch (algorithm) {
                    case HashAlgorithm.Sha384:
                        return deriveKey(SHA384, password, salt, iterations, length);
                    case HashAlgorithm.Sha512:
                        return deriveKey(SHA512, password, salt, iterations, length);
                    default: throw new Error("(BUG) Non-Exhaustive switch statement for algorithms");
                }
            }
        }

        switch (algorithm) {
            case HashAlgorithm.Sha384:
                return pbkdf2(password, salt, iterations, length, "sha384");
            case HashAlgorithm.Sha512:
                return pbkdf2(password, salt, iterations, length, "sha512");
            default: throw new Error("(BUG) Non-Exhaustive switch statement for algorithms");
        }
    }
}
