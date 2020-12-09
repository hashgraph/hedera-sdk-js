/**
 * @param {string} text
 * @returns {Uint8Array}
 */
export function decode(text) {
    // note: assumes <atob> is available in the global scope if <Buffer> is not
    return Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
}

/**
 * @param {Uint8Array} data
 * @returns {string};
 */
export function encode(data) {
    // note: assumes <btoa> is available in the global scope if <Buffer> is not
    return btoa(String.fromCharCode.apply(null, Array.from(data)));
}
