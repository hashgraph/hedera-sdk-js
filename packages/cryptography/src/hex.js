const byteToHex = [];
for (let n = 0; n <= 0xFF; n += 1) {
    const hexOctet = n.toString(16).padStart(2, "0");
    byteToHex.push(hexOctet);
}

/**
 * @param {Uint8Array} bytes
 * @return {string}
 */
export function encode(bytes) {
    if (typeof global.globalThis.Buffer !== "undefined") {
        return Buffer.from(bytes).toString("hex");
    } else {
        return bytes.map((b) => byteToHex[ b ]).join("");
    }
}

/**
 * @param {string} s
 * @return {Uint8Array | Buffer}
 */
export function decode(s) {
    const str = s.startsWith("0x") ? s.substring(2) : s;

    if (typeof global.globalThis.Buffer !== "undefined") {
        return Buffer.fromString(str, "hex");
    } else {
        return new Uint8Array(str.match(/.{1,2}/gu).map((byte) => parseInt(byte, 16)));
    }
}
