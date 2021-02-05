import * as pbkdf2 from "../primitive/pbkdf2.js";
import * as hmac from "../primitive/hmac.js";

/**
 * @param {Uint8Array} seed
 * @param {number} index
 * @returns {Promise<Uint8Array>}
 */
export function legacy(seed, index) {
    const password = new Uint8Array(seed.length + 8);
    password.set(seed, 0);

    const view = new DataView(
        password.buffer,
        password.byteOffset + seed.length,
        8
    );
    view.setInt32(0, index);
    view.setInt32(4, index);

    const salt = Uint8Array.from([0xff]);
    return pbkdf2.deriveKey(
        hmac.HashAlgorithm.Sha512,
        password,
        salt,
        2048,
        32
    );
}
