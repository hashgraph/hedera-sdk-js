import { isAccessible } from "../util.js";

/**
 * @param {string} text
 * @returns {Uint8Array}
 */
export function decode(text) {
    if (isAccessible("Buffer")) {
        return Buffer.from(text, "base64");
    } else {
        return Uint8Array.from(window.atob(text), (c) => c.charCodeAt(0));
    }
}
