import { isAccessible } from "./util.js";

/**
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function decode(bytes) {
    if (isAccessible("Buffer")) {
        return Buffer.from(bytes).toString("utf8");
    } else {
        // eslint-disable-next-line node/no-unsupported-features/node-builtins
        return new TextDecoder().decode(bytes);
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
        // eslint-disable-next-line node/no-unsupported-features/node-builtins
        return new TextEncoder().encode(string);
    }
}
