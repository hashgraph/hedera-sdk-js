import * as crypto from "crypto";
import * as utf8 from "@stablelib/utf8";
import { hmac } from "@stablelib/hmac";
import { SHA512 } from "@stablelib/sha512";
import { SHA384 } from "@stablelib/sha384";
import { SHA256 } from "@stablelib/sha256";

export enum HashAlgorithm {
    Sha256 = "SHA-256",
    Sha384 = "SHA-384",
    Sha512 = "SHA-512"
}

export class Hmac {
    public static async hash(
        algorithm: HashAlgorithm,
        data: Uint8Array | string,
        secretKey: Uint8Array
    ): Promise<Uint8Array> {
        const value = typeof data === "string" ? utf8.encode(data) : data;

        if (typeof window !== "undefined") {
            // Try SubtleCrypto if it exists, otherwise fallback to @stablelibs/Hmac
            try {
                const key = await window!.crypto.subtle.importKey("raw", secretKey, {
                    name: "HMAC",
                    hash: algorithm
                }, false, [ "sign" ]);

                return new Uint8Array(await window!.crypto.subtle.sign("HMAC", key, value));
            } catch {
                switch (algorithm) {
                    case HashAlgorithm.Sha256:
                        return hmac(SHA256, secretKey, value);
                    case HashAlgorithm.Sha384:
                        return hmac(SHA384, secretKey, value);
                    case HashAlgorithm.Sha512:
                        return hmac(SHA512, secretKey, value);
                    default: throw new Error("(BUG) Non-Exhaustive switch statement for algorithms");
                }
            }
        }

        switch (algorithm) {
            case HashAlgorithm.Sha256:
                return crypto.createHmac("SHA256", value).update(secretKey).digest();
            case HashAlgorithm.Sha384:
                return crypto.createHmac("SHA384", value).update(secretKey).digest();
            case HashAlgorithm.Sha512:
                return crypto.createHmac("SHA512", value).update(secretKey).digest();
            default: throw new Error("(BUG) Non-Exhaustive switch statement for algorithms");
        }
    }
}

