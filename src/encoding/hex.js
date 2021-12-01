/**
 * @param {Uint8Array} data
 * @returns {string}
 */
export function encode(data) {
    return Buffer.from(data).toString("hex");
}

/**
 * @param {string} text
 * @returns {Uint8Array}
 */
export function decode(text) {
    const str = text.startsWith("0x") ? text.substring(2) : text;
    return Buffer.from(str, "hex");
}
