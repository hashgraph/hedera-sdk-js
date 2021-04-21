/**
 * @param {Uint8Array} data
 * @returns {string}
 */
export function decode(data) {
    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    return new TextDecoder().decode(data);
}

/**
 * @param {string} text
 * @returns {Uint8Array}
 */
export function encode(text) {
    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    return new TextEncoder().encode(text);
}
