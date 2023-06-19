import { Buffer } from "buffer";

/**
 * @param {string} text
 * @returns {Uint8Array}
 */
export function decode(text) {
    // note: assumes <atob> is available in the global scope if <Buffer> is not
    // eslint-disable-next-line deprecation/deprecation

    return Uint8Array.from(Buffer.from(text, "base64"));
}

/**
 * @param {Uint8Array} data
 * @returns {string};
 */
export function encode(data) {
    // note: assumes <btoa> is available in the global scope if <Buffer> is not
    // eslint-disable-next-line deprecation/deprecation
    return btoa(String.fromCharCode.apply(null, Array.from(data)));
}
