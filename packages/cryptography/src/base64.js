/**
 * @param {string} text
 * @returns {Uint8Array}
 */
export function decode(text) {
    if (typeof global.window !== "undefined") {
        return Uint8Array.from(window.atob(text), (c) => c.charCodeAt(0));
    }

    return Buffer.from(text, "base64");
}
