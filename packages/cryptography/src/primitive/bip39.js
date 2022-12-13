import * as hmac from "../primitive/hmac.js";
import * as pbkdf2 from "./pbkdf2.js";

/**
 * @param {string[]} words
 * @param {string} passphrase
 * @returns {Promise<Uint8Array>}
 */
export async function toSeed(words, passphrase) {
    const input = words.join(" ");
    const salt = `mnemonic${passphrase}`.normalize("NFKD");

    return pbkdf2.deriveKey(hmac.HashAlgorithm.Sha512, input, salt, 2048, 64);
}
