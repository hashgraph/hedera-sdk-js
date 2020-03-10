import * as crypto from "crypto";
import * as utf8 from "@stablelib/utf8";

export enum HashAlgorithm {
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
            const key = await window!.crypto.subtle.importKey("raw", secretKey, {
                name: "HMAC",
                hash: algorithm
            }, false, [ "sign" ]);

            return new Uint8Array(await window!.crypto.subtle.sign("HMAC", key, value));
        }

        switch (algorithm) {
            case HashAlgorithm.Sha384:
                return crypto.createHmac("SHA384", value).update(secretKey).digest();
            case HashAlgorithm.Sha512:
                return crypto.createHmac("SHA512", value).update(secretKey).digest();
            default: throw new Error("(BUG) Non-Exhaustive switch statement for algorithms");
        }
    }
}

