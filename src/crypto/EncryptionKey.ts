import * as crypto from "crypto";
import * as nacl from "tweetnacl";
import { Pbkdf2 } from "./Pbkdf2";
import { Hmac, HashAlgorithm } from "./Hmac";
import * as utf8 from "@stablelib/utf8";

const AES_128_CTR = "aes-128-ctr";

export class EncryptionKey {
    private key: Uint8Array;
    private salt: Uint8Array;
    private passphrase: string;

    private static dkLen = 32;
    private static c = 262144;
    private static saltLen = 32;

    private constructor(passphrase: string, salt: Uint8Array, key: Uint8Array) {
        this.passphrase = passphrase;
        this.salt = salt;
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

        return new EncryptionKey(passphrase, salt, key);
    }

    public async encrypt(messageStrOrBytes: string | Uint8Array): Promise<Uint8Array> {
        // AES-128-CTR with the first half of the derived key and a random IV
        const message = typeof messageStrOrBytes === "string" ?
            utf8.encode(messageStrOrBytes) :
            messageStrOrBytes;

        const iv = nacl.randomBytes(16);
        const cipher = crypto.createCipheriv(AES_128_CTR, this.key.slice(0, 16), iv);

        const cipherText = Buffer.concat([ cipher.update(message), cipher[ "final" ]() ]);

        const keyFingerPrint = (await Hmac.hash(
            HashAlgorithm.Sha384,
            this.key.slice(16),
            new Uint8Array()
        ))
            .subarray(0, 4);

        const passphraseFingerPrint = (await Hmac.hash(
            HashAlgorithm.Sha384,
            this.passphrase,
            new Uint8Array()
        ))
            .subarray(0, 4);

        // 8 Bytes for the header containing current chunk number, and total number of chunks.
        // 16 Bytes for the iv.
        // 16 Bytes for the salt.
        // 4 Bytes for the key fingerprint.
        // 4 Bytes for the passphrase fingerprint.
        const encoded = new Uint8Array(8 + 16 + 16 + 4 + 4 + cipherText.length);
        encoded.set(iv, 8);
        encoded.set(this.salt, 8 + 16);
        encoded.set(keyFingerPrint, 8 + 16 + 16);
        encoded.set(passphraseFingerPrint, 8 + 16 + 16);
        encoded.set(cipherText, 8 + 16 + 16 + 4 + 4);
        return encoded;
    }
}
