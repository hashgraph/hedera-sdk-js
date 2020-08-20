import { isAccessible } from "./util.js";

/**
 * @type {string[]}
 */
const byteToHex = [];
for (let n = 0; n <= 0xff; n += 1) {
    const hexOctet = n.toString(16).padStart(2, "0");
    byteToHex.push(hexOctet);
}

/**
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function encode(bytes) {
    if (isAccessible("Buffer")) {
        return Buffer.from(bytes).toString("hex");
    } else {
        return bytes.map((b) => parseInt(byteToHex[b])).join("");
    }
}

/**
 * @param {string} s
 * @returns {Uint8Array | Buffer}
 */
export function decode(s) {
    const str = s.startsWith("0x") ? s.substring(2) : s;

    if (isAccessible("Buffer")) {
        return Buffer.from(str, "hex");
    } else {
        const result = str.match(/.{1,2}/gu);
        return new Uint8Array(
            (result == null ? [] : result).map((byte) => parseInt(byte, 16))
        );
    }
}
