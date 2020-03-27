import * as crypto from "crypto";
import * as nacl from "tweetnacl";
import { Pbkdf2 } from "./Pbkdf2";
import { Hmac, HashAlgorithm } from "./Hmac";
import * as utf8 from "@stablelib/utf8";

const AES_128_CTR = "aes-128-ctr";

export class EncryptionKey {
    private key: Uint8Array;
    private passphrase: string;

    private static dkLen = 32;
    private static c = 262144;
    private static saltLen = 32;

    private constructor(passphrase: string, key: Uint8Array) {
        this.passphrase = passphrase;
        this.key = key;
    }

    public static async fromPassphrase(passphrase: string): Promise<EncryptionKey> {
        const salt = nacl.randomBytes(EncryptionKey.saltLen);

        const key = await Pbkdf2.deriveKey(
            HashAlgorithm.Sha384,
            passphrase,
            salt,
            EncryptionKey.c,
            EncryptionKey.dkLen
        );

        return new EncryptionKey(passphrase, key);
    }

    public async encrypt(messageStr: string): Promise<Uint8Array> {
        // AES-128-CTR with the first half of the derived key and a random IV
        const message = utf8.encode(messageStr);
        const iv = nacl.randomBytes(16);
        const cipher = crypto.createCipheriv(AES_128_CTR, this.key.slice(0, 16), iv);

        const cipherText = Buffer.concat([ cipher.update(message), cipher[ "final" ]() ]);

        const mac = (await Hmac.hash(HashAlgorithm.Sha384, this.key.slice(16), cipherText))
            .subarray(0, 4);

        const encoded = new Uint8Array(20 + message.length);
        encoded.set(iv, 0);
        encoded.set(mac, 16);
        encoded.set(message, 20);
        return encoded;
    }
}
