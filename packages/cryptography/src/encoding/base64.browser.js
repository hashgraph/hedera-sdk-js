import { Buffer } from "buffer";

/**
 * @param {string} text
 * @returns {Uint8Array}
 */
export function decode(text) {
    return Uint8Array.from(Buffer.from(text, "base64"));
}

/**
 * @param {Uint8Array} data
 * @returns {string};
 */
export function encode(data) {
    return Buffer.from(data).toString("base64");
}
