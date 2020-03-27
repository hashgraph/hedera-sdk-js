import * as crypto from "crypto";
import * as nacl from "tweetnacl";
import { Pbkdf2 } from "./Pbkdf2";
import { BadKeyError } from "../errors/BadKeyError";
import { EncryptedPrivateKeyInfo } from "./pkcs";
import { decodeDer } from "./der";
import { BadPemFileError } from "../errors/BadPemFileError";
import { HashAlgorithm } from "./Hmac";
import * as base64 from "../encoding/base64";
import { Ed25519PrivateKey } from "./Ed25519PrivateKey";

const beginPrivateKey = "-----BEGIN PRIVATE KEY-----\n";
const endPrivateKey = "-----END PRIVATE KEY-----\n";

const beginEncryptedPkey = "-----BEGIN ENCRYPTED PRIVATE KEY-----\n";
const endEncryptedPkey = "-----END ENCRYPTED PRIVATE KEY-----\n";

const AES_128_CTR = "aes-128-ctr";

export class EncryptionKey {
    private cipher: crypto.Cipher;

    private static dkLen = 32;
    private static c = 262144;
    private static saltLen = 32;

    private constructor(cipher: crypto.Cipher) {
        this.cipher = cipher;
    }

    // public static async fromPem(pem: string, passphrase?: string): Promise<EncryptionKey> {
    //     const beginTag = passphrase ? beginEncryptedPkey : beginPrivateKey;
    //     const endTag = passphrase ? endEncryptedPkey : endPrivateKey;

    //     const beginIndex = pem.indexOf(beginTag);
    //     const endIndex = pem.indexOf(endTag);

    //     if (beginIndex === -1 || endIndex === -1) {
    //         throw new BadPemFileError();
    //     }

    //     const keyEncoded = pem.slice(beginIndex + beginTag.length, endIndex);

    //     const keyStr = base64.decode(keyEncoded);

    //     let key;

    //     if (passphrase) {
    //         let encrypted;

    //         try {
    //             encrypted = EncryptedPrivateKeyInfo.parse(keyStr);
    //         } catch (error) {
    //             throw new BadKeyError(`failed to parse encrypted private key: ${error.message}`);
    //         }

    //         const decrypted = await encrypted.decrypt(passphrase);

    //         if (decrypted.algId.algIdent !== "1.3.101.112") {
    //             throw new BadKeyError(`unknown private key algorithm ${decrypted.algId}`);
    //         }

    //         const keyData = decodeDer(decrypted.privateKey);

    //         if ("bytes" in keyData) {
    //             Ed25519PrivateKey.fromBytes(keyData.bytes);
    //             key = keyData.bytes;
    //         } else {
    //             throw new BadKeyError(`expected ASN bytes, got ${JSON.stringify(keyData)}`);
    //         }
    //     } else {
    //         Ed25519PrivateKey.fromBytes(keyStr);
    //         key = keyStr;
    //     }

    //     const iv = nacl.randomBytes(16);
    //     const cipher = crypto.createCipheriv(AES_128_CTR, key.slice(0, 16), iv);

    //     return new EncryptionKey(cipher);
    // }

    public static async fromPassphrase(passphrase: string): Promise<EncryptionKey> {
        const salt = nacl.randomBytes(EncryptionKey.saltLen);
        const key = await Pbkdf2.deriveKey(
            HashAlgorithm.Sha256,
            passphrase,
            salt,
            EncryptionKey.c,
            EncryptionKey.dkLen
        );
        const iv = nacl.randomBytes(16);

        // AES-128-CTR with the first half of the derived key and a random IV
        const cipher = crypto.createCipheriv(AES_128_CTR, key.slice(0, 16), iv);

        return new EncryptionKey(cipher);
    }

    // public async encrypt(text: string): Uint8Array {
    // }
}
