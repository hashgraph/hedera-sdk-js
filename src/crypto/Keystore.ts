import * as crypto from "crypto";
import * as nacl from "tweetnacl";
import { hmacAlgo, pbkdf2 } from "./util";
import { RawKeyPair } from "./RawKeyPair";
import { KeyMismatchException } from "./KeyMismatchException";

export type Keystore = {
    version: 1;
    crypto: {
        /** hex-encoded ciphertext */
        ciphertext: string;
        /** hex-encoded initialization vector */
        cipherparams: { iv: string };
        /** cipher being used */
        cipher: "aes-128-ctr";
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
            prf: "hmac-sha256";
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
    const salt = crypto.randomBytes(saltLen);

    const key = await pbkdf2(passphrase, salt, c, dkLen, "sha256");

    const iv = crypto.randomBytes(16);

    // AES-128-CTR with the first half of the derived key and a random IV
    const cipher = crypto.createCipheriv("aes-128-ctr", key.slice(0, 16), iv);

    const cipherText = Buffer.concat([ cipher.update(privateKey), cipher[ "final" ]() ]);

    const mac = crypto.createHmac(hmacAlgo, key.slice(16)).update(cipherText).digest();

    const keystore: Keystore = {
        version: 1,
        crypto: {
            ciphertext: cipherText.toString("hex"),
            cipherparams: { iv: iv.toString("hex") },
            cipher: "aes-128-ctr",
            kdf: "pbkdf2",
            kdfparams: {
                dkLen,
                salt: salt.toString("hex"),
                c,
                prf: "hmac-sha256"
            },
            mac: mac.toString("hex")
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

    if (prf !== "hmac-sha256") {
        throw new Error(`unsupported key derivation hash function: ${prf}`);
    }

    const saltBytes = Buffer.from(salt, "hex");
    const ivBytes = Buffer.from(iv, "hex");
    const cipherBytes = Buffer.from(ciphertext, "hex");

    const key = await pbkdf2(passphrase, saltBytes, c, dkLen, "sha256");

    const hmac = Buffer.from(mac, "hex");
    const verifyHmac = crypto.createHmac(hmacAlgo, key.slice(16)).update(cipherBytes).digest();

    if (!hmac.equals(verifyHmac)) {
        throw new KeyMismatchException(hmac, verifyHmac);
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
