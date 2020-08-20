import { isAccessible } from "./util.js";

/**
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function decode(bytes) {
    if (isAccessible("Buffer")) {
        return Buffer.from(bytes).toString("utf8");
    } else {
        throw new Error("Decoding utf8 on web not implemented");
    }
}

/**
 * @param {string} string
 * @returns {Uint8Array}
 */
export function encode(string) {
    if (isAccessible("Buffer")) {
        return Buffer.from(string, "utf8");
    } else {
        throw new Error("Encoding utf8 on web not implemented");
    }
}
