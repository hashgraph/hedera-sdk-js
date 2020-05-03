export function encode(bytes) {
    let s = "";

    for (let i = 0; i < bytes.length; i++) {
        s += encodeQuartet(bytes[i] >>> 4);
        s += encodeQuartet(bytes[i] & 0x0f);
    }

    return s;
}

export function decode(s) {
    const bytes = new Uint8Array(s.length / 2);

    for (let i = 0; i < s.length; i += 2) {
        let b0 = decodeQuartet(s.charCodeAt(i));
        let b1 = decodeQuartet(s.charCodeAt(i + 1));

        bytes[i / 2] = b0 << 4 | b1;
    }

    return bytes;
}

function encodeQuartet(b) {
    return String.fromCharCode(
        (b + 48) + (((9 - b) >>> 8) & (-48 + 97 - 10)));
}

function decodeQuartet(c) {
    let result = 255;

    // 0-9: c > 47 and c < 58
    result += (((47 - c) & (c - 58)) >> 8) & (-255 + c - 48);

    // A-F: c > 64 and c < 71
    result += (((64 - c) & (c - 71)) >> 8) & (-255 + c - 65 + 10);

    // a-f: c > 96 and c < 103
    result += (((96 - c) & (c - 103)) >> 8) & (-255 + c - 97 + 10);

    return result;

}
