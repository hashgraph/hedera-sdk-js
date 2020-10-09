import BadKeyError from "../BadKeyError.js";
import { EncryptedPrivateKeyInfo } from "../primitive/pkcs.js";
import * as der from "./der.js";
import * as base64 from "./base64.js";
import nacl from "tweetnacl";

const BEGIN_PRIVATEKEY = "-----BEGIN PRIVATE KEY-----\n";
const END_PRIVATEKEY = "-----END PRIVATE KEY-----\n";

const BEGIN_ENCRYPTED_PRIVATEKEY = "-----BEGIN ENCRYPTED PRIVATE KEY-----\n";
const END_ENCRYPTED_PRIVATEKEY = "-----END ENCRYPTED PRIVATE KEY-----\n";

/**
 * @param {string} pem
 * @param {string} [passphrase]
 * @returns {Promise<nacl.SignKeyPair>}
 */
export async function read(pem, passphrase) {
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
            throw new BadKeyError(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/explicit-module-boundary-types
                `failed to parse encrypted private key: ${error.message}`
            );
        }

        const decrypted = await encrypted.decrypt(passphrase);

        if (decrypted.algId.algIdent !== "1.3.101.112") {
            throw new BadKeyError(
                `unknown private key algorithm ${decrypted.algId.toString()}`
            );
        }

        const keyData = der.decode(decrypted.privateKey);

        if ("bytes" in keyData) {
            return nacl.sign.keyPair.fromSeed(keyData.bytes);
        }

        throw new BadKeyError(
            `expected ASN bytes, got ${JSON.stringify(keyData)}`
        );
    }

    return nacl.sign.keyPair.fromSeed(key.subarray(16));
}
