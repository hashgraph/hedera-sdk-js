/**
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function encode(bytes) {
    if (typeof btoa !== 'undefined') {
        return btoa(String.fromCharCode(...bytes));
    }

    return Buffer.from(bytes).toString("base64");
}

/**
 * @param {string} s
 * @returns {Uint8Array}
 */
export function decode(s) {
    if (typeof atob !== 'undefined') {
        return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
    }

    return new Uint8Array(Buffer.from(s, "base64"));
}
