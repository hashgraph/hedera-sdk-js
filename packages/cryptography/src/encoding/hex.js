
/**
 * @type {string[]}
 */
const byteToHex = [];

for (let n = 0; n <= 0xff; n += 1) {
    byteToHex.push(n.toString(16).padStart(2, "0"));
}

/**
 * @param {Uint8Array} data
 * @returns {string}
 */
export function encode(data) {
    if (typeof Buffer !== "undefined") {
        return Buffer.from(data).toString("hex");
    }

    let string = "";

    for (const byte of data) {
        string += byteToHex[byte];
    }

    return string;
}

/**
 * @param {string} text
 * @returns {Uint8Array}
 */
export function decode(text) {
    const str = text.startsWith("0x") ? text.substring(2) : text;

    if (typeof Buffer !== "undefined") {
        return Buffer.from(str, "hex");
    }

    const result = str.match(/.{1,2}/gu);

    return new Uint8Array(
        (result == null ? [] : result).map((byte) => parseInt(byte, 16))
    );
}
