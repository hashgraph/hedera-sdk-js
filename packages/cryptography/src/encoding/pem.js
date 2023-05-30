import BadKeyError from "../BadKeyError.js";
import { EncryptedPrivateKeyInfo } from "../primitive/pkcs.js";
import * as der from "./der.js";
import * as base64 from "./base64.js";
import Ed25519PrivateKey from "../Ed25519PrivateKey.js";
import EcdsaPrivateKey from "../EcdsaPrivateKey.js";
import * as asn1 from "asn1js";
import crypto from "crypto";
import { type } from "os";

const BEGIN_PRIVATEKEY = "-----BEGIN PRIVATE KEY-----\n";
const END_PRIVATEKEY = "-----END PRIVATE KEY-----\n";

const BEGIN_ENCRYPTED_PRIVATEKEY = "-----BEGIN ENCRYPTED PRIVATE KEY-----\n";
const END_ENCRYPTED_PRIVATEKEY = "-----END ENCRYPTED PRIVATE KEY-----\n";

const ID_ED25519 = "1.3.101.112";
const ID_ECDSA_SECP256K1 = "1.3.132.0.10";
const ID_ECDSA_SECP256K1_PUBLIC_KEY = "1.2.840.10045.2.1";

/**
 * @param {string} pem
 * @param {string} [passphrase]
 * @returns {Promise<Ed25519PrivateKey | EcdsaPrivateKey | Uint8Array>}
 */
export async function read(pem, passphrase) {
    console.log(pem)
    const pemKeyData = pem.replace(/-----BEGIN (.*)-----|-----END (.*)-----|\n|\r/g, '').trim();
    console.log(`pemKeyData: ${pemKeyData}`)
    
    const key = base64.decode(pemKeyData);
    //const cryptoKey = crypto.createPrivateKey(pem);
    /* const exported = cryptoKey.export({
        format: 'der',
        type: 'sec1'
    }); */
    
    const asnData = asn1.fromBER(key.buffer);

    const parsedKey = asnData.result;
    console.log(parsedKey.name)

    if (passphrase) {
        console.log(`in`)
        let encrypted;

        try {
            encrypted = EncryptedPrivateKeyInfo.parse(key);
        } catch (error) {
            const message =
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                error != null && /** @type {Error} */ (error).message != null
                    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                      /** @type {Error} */ (error).message
                    : "";

            throw new BadKeyError(
                `failed to parse encrypted private key: ${message}`
            );
        }

        const decrypted = await encrypted.decrypt(passphrase);

        let privateKey = null;

        if (decrypted.algId.algIdent === ID_ED25519) {
            privateKey = Ed25519PrivateKey;
        } else if (decrypted.algId.algIdent === ID_ECDSA_SECP256K1) {
            privateKey = EcdsaPrivateKey;
        } else {
            throw new BadKeyError(
                `unknown private key algorithm ${decrypted.algId.toString()}`
            );
        }

        const keyData = der.decode(decrypted.privateKey);

        if (!("bytes" in keyData)) {
            throw new BadKeyError(
                `expected ASN bytes, got ${JSON.stringify(keyData)}`
            );
        }

        console.log(`\nEND`);
        console.log(privateKey.fromBytes(keyData.bytes));
        return privateKey.fromBytes(keyData.bytes);
    }
    
    console.log(`\nEND OUTSIDE`);
    console.log(key.subarray(16));
    return key.subarray(16);
}
