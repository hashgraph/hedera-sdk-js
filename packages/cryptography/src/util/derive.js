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

    if (index === 0xffffffffff) {
        view.setInt32(0, 0xff);
        view.setInt32(4, index >>> 32);
    } else {
        view.setInt32(0, index < 0 ? -1 : 0);
        view.setInt32(4, index);
    }

    const salt = Uint8Array.from([0xff]);
    return pbkdf2.deriveKey(
        hmac.HashAlgorithm.Sha512,
        password,
        salt,
        2048,
        32
    );
}
