import BadKeyError from "../BadKeyError.js";
import { EncryptedPrivateKeyInfo } from "../primitive/pkcs.js";
import * as der from "./der.js";
import * as base64 from "./base64.js";
import Ed25519PrivateKey from "../Ed25519PrivateKey.js";
import EcdsaPrivateKey from "../EcdsaPrivateKey.js";
import * as asn1 from "asn1js";
import * as hex from "./hex.js";
import * as aes from "../primitive/aes.js";

const ID_ED25519 = "1.3.101.112";

/**
 * @param {string} pem
 * @param {string} [passphrase]
 * @returns {Promise<Ed25519PrivateKey | EcdsaPrivateKey | Uint8Array>}
 */
export async function readPemED25519(pem, passphrase) {
    const pemKeyData = pem.replace(
        /-----BEGIN (.*)-----|-----END (.*)-----|\n|\r/g,
        "",
    );

    const key = base64.decode(pemKeyData);
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
                `failed to parse encrypted private key: ${message}`,
            );
        }

        const decrypted = await encrypted.decrypt(passphrase);

        let privateKey = null;

        if (decrypted.algId.algIdent === ID_ED25519) {
            privateKey = Ed25519PrivateKey;
        } else {
            throw new BadKeyError(
                `unknown private key algorithm ${decrypted.algId.toString()}`,
            );
        }

        const keyData = der.decode(decrypted.privateKey);

        if (!("bytes" in keyData)) {
            throw new BadKeyError(
                `expected ASN bytes, got ${JSON.stringify(keyData)}`,
            );
        }

        return privateKey.fromBytes(keyData.bytes);
    }

    return key.subarray(16);
}

/**
 * @param {string} pem
 * @param {string} [passphrase]
 * @returns {Promise<Ed25519PrivateKey | EcdsaPrivateKey | Uint8Array>}
 */
export async function readPemECDSA(pem, passphrase) {
    const pemKeyData = pem.replace(
        /-----BEGIN (.*)-----|-----END (.*)-----|\n|\r/g,
        "",
    );
    const key = base64.decode(pemKeyData);

    if (passphrase) {
        // Parse PEM headers to get encryption info
        const pemLines = pem.split("\n");
        const dekInfoLine = pemLines.find((line) =>
            line.startsWith("DEK-Info:"),
        );

        if (!dekInfoLine) {
            throw new Error("Missing DEK-Info in encrypted PEM");
        }

        // Parse DEK-Info header (format: "DEK-Info: AES-128-CBC,{hex-iv}")
        const [algorithm, ivString] = dekInfoLine
            .substring(9)
            .trim()
            .split(",");

        if (algorithm !== "AES-128-CBC") {
            throw new Error(`Unsupported encryption algorithm: ${algorithm}`);
        }

        const iv = hex.decode(ivString);
        const derivedKey = await aes.messageDigest(passphrase, ivString);

        // Get encrypted data (skip header lines and empty lines)
        const encryptedData = pemLines
            .slice(4, pemLines.length - 1)
            .filter((line) => line && !line.includes(":"))
            .join("");

        const dataToDecrypt = base64.decode(encryptedData);

        const keyDerBytes = await aes.createDecipheriv(
            aes.CipherAlgorithm.Aes128Cbc,
            derivedKey,
            iv,
            dataToDecrypt,
        );

        return EcdsaPrivateKey.fromBytesDer(keyDerBytes);
    } else {
        const asnData = asn1.fromBER(key);
        const parsedKey = asnData.result;

        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        return parsedKey.valueBlock.value[1].valueBlock.valueHexView;
    }
}

/**
 * @param {string} pem
 * @param {string} [passphrase]
 * @returns {Promise<Ed25519PrivateKey | EcdsaPrivateKey | Uint8Array>}
 */
export async function read(pem, passphrase) {
    // If not then it is ED25519 type
    const isEcdsa = pem.includes("BEGIN EC PRIVATE KEY") ? true : false;
    if (isEcdsa) {
        return readPemECDSA(pem, passphrase);
    } else {
        return readPemED25519(pem, passphrase);
    }
}
