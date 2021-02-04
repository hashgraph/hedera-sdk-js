import * as crypto from "crypto";
import * as StableLibSha256 from "@stablelib/sha256";

export class Sha256 {
    public static async hash(data: Uint8Array): Promise<Uint8Array> {
        if (typeof window !== "undefined") {
            // Try SubtleCrypto if it exists, otherwise fallback to @stablelibs/sha256
            try {
                const digest = await window!.crypto.subtle.digest("SHA-256", data);
                return new Uint8Array(digest);
            } catch {
                return StableLibSha256.hash(data);
            }
        }

        const hasher = crypto.createHash("sha256");
        hasher.update(data);
        return hasher.digest();
    }
}
