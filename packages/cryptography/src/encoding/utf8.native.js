import utf8 from "@stablelib/utf8";

/**
 * @param {Uint8Array} data
 * @returns {string}
 */
export function decode(data) {
    return utf8.decode(data);
}

/**
 * @param {string} text
 * @returns {Uint8Array}
 */
export function encode(text) {
    return utf8.encode(text);
}
