/**
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function decode(bytes) {
    if (global.globalThis.Buffer === "undefined") {
        throw new Error("Decoding utf8 on web not implemented");
    } else {
        return Buffer.from(bytes, "utf8").toString();
    }
}

/**
 * @param {string} string
 * @returns {Uint8Array}
 */
function encode(string) {
    if (global.globalThis.Buffer === "undefined") {
        throw new Error("Encoding utf8 on web not implemented");
    } else {
        return Buffer.from(string).toString("utf8");
    }
}
