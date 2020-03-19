import * as crypto from "crypto";
import * as nacl from "tweetnacl";
import { RawKeyPair } from "./RawKeyPair";
import { KeyMismatchError } from "./KeyMismatchError";
import * as hex from "@stablelib/hex";
import { Hmac, HashAlgorithm } from "./Hmac";
import { Pbkdf2 } from "./Pbkdf2";

const AES_128_CTR = "aes-128-ctr";
const HMAC_SHA256 = "hmac-sha256";

export interface Keystore {
    version: 1;
    crypto: {
        /** hex-encoded ciphertext */
        ciphertext: string;
        /** hex-encoded initialization vector */
        cipherparams: { iv: string };
        /** cipher being used */
        cipher: typeof AES_128_CTR;
        /** key derivation function being used */
        kdf: "pbkdf2";
        /** params for key derivation function */
        kdfparams: {
            /** derived key length */
            dkLen: number;
            /** hex-encoded salt */
            salt: string;
            /** iteration count */
            c: number;
            /** hash function */
            prf: typeof HMAC_SHA256;
        };
        /** hex-encoded HMAC-SHA384 */
        mac: string;
    };
}

export async function createKeystore(
    privateKey: Uint8Array,
    passphrase: string
): Promise<Uint8Array> {
    // all values taken from https://github.com/ethereumjs/ethereumjs-wallet/blob/de3a92e752673ada1d78f95cf80bc56ae1f59775/src/index.ts#L25
    const dkLen = 32;
    const c = 262144;
    const saltLen = 32;
    const salt = nacl.randomBytes(saltLen);

    const key = await Pbkdf2.deriveKey(HashAlgorithm.Sha256, passphrase, salt, c, dkLen);

    const iv = nacl.randomBytes(16);

    // AES-128-CTR with the first half of the derived key and a random IV
    const cipher = crypto.createCipheriv(AES_128_CTR, key.slice(0, 16), iv);

    const cipherText = Buffer.concat([ cipher.update(privateKey), cipher[ "final" ]() ]);

    const mac = await Hmac.hash(HashAlgorithm.Sha384, key.slice(16), cipherText);

    const keystore: Keystore = {
        version: 1,
        crypto: {
            ciphertext: hex.encode(cipherText, true),
            cipherparams: { iv: hex.encode(iv, true) },
            cipher: AES_128_CTR,
            kdf: "pbkdf2",
            kdfparams: {
                dkLen,
                salt: hex.encode(salt, true),
                c,
                prf: HMAC_SHA256
            },
            mac: hex.encode(mac, true)
        }
    };

    return Buffer.from(JSON.stringify(keystore));
}

export async function loadKeystore(
    keystoreBytes: Uint8Array,
    passphrase: string
): Promise<RawKeyPair> {
    const keystore: Keystore = JSON.parse(Buffer.from(keystoreBytes).toString());

    if (keystore.version !== 1) {
        throw new Error(`unsupported keystore version: ${keystore.version}`);
    }

    const {
        ciphertext,
        cipherparams: { iv },
        cipher,
        kdf,
        kdfparams: { dkLen, salt, c, prf }, mac
    } = keystore.crypto;

    if (kdf !== "pbkdf2") {
        throw new Error(`unsupported key derivation function: ${kdf}`);
    }

    if (prf !== HMAC_SHA256) {
        throw new Error(`unsupported key derivation hash function: ${prf}`);
    }

    const saltBytes = hex.decode(salt);
    const ivBytes = hex.decode(iv);
    const cipherBytes = hex.decode(ciphertext);

    const key = await Pbkdf2.deriveKey(HashAlgorithm.Sha256, passphrase, saltBytes, c, dkLen);

    const hmac = hex.decode(mac);
    const verifyHmac = await Hmac.hash(HashAlgorithm.Sha384, key.slice(16), cipherBytes);

    if (!Buffer.from(hmac).equals(verifyHmac)) {
        throw new KeyMismatchError(hmac, verifyHmac);
    }

    const decipher = crypto.createDecipheriv(cipher, key.slice(0, 16), ivBytes);
    const privateKeyBytes = Buffer.concat([ decipher.update(cipherBytes), decipher[ "final" ]() ]);

    // `Buffer instanceof Uint8Array` doesn't work in Jest because the prototype chain is different
    const {
        secretKey: privateKey,
        publicKey
    } = nacl.sign.keyPair.fromSecretKey(Uint8Array.from(privateKeyBytes));

    return { privateKey, publicKey };
}
