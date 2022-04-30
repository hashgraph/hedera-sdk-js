import BadKeyError from "../BadKeyError.js";
import { EncryptedPrivateKeyInfo } from "../primitive/pkcs.js";
import * as der from "./der.js";
import * as base64 from "./base64.js";
import Ed25519PrivateKey from "../Ed25519PrivateKey.js";
import EcdsaPrivateKey from "../EcdsaPrivateKey.js";

const BEGIN_PRIVATEKEY = "-----BEGIN PRIVATE KEY-----\n";
const END_PRIVATEKEY = "-----END PRIVATE KEY-----\n";

const BEGIN_ENCRYPTED_PRIVATEKEY = "-----BEGIN ENCRYPTED PRIVATE KEY-----\n";
const END_ENCRYPTED_PRIVATEKEY = "-----END ENCRYPTED PRIVATE KEY-----\n";

/**
 * @param {string} pem
 * @param {string} [passphrase]
 * @returns {Promise<Ed25519PrivateKey | EcdsaPrivateKey | Uint8Array>}
 */
export async function read(pem, passphrase) {
    //NOSONAR
    const beginTag = passphrase ? BEGIN_ENCRYPTED_PRIVATEKEY : BEGIN_PRIVATEKEY;

    const endTag = passphrase ? END_ENCRYPTED_PRIVATEKEY : END_PRIVATEKEY;

    const beginIndex = pem.indexOf(beginTag);
    const endIndex = pem.indexOf(endTag);

    if (beginIndex === -1 || endIndex === -1) {
        throw new BadKeyError("failed to find a private key in the PEM file");
    }

    const keyEncoded = pem.slice(beginIndex + beginTag.length, endIndex);

    const key = base64.decode(keyEncoded);

    if (passphrase) {
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

        if (decrypted.algId.algIdent === "1.3.101.112") {
            privateKey = Ed25519PrivateKey;
        } else if (decrypted.algId.algIdent === "1.3.132.0.10") {
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

        return privateKey.fromBytes(keyData.bytes);
    }

    return key.subarray(16);
}
