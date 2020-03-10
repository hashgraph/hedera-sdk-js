export function encode(bytes: Uint8Array): string {
    return bytes.reduce((prev, val) => {
        if (val < 16) {
            // eslint-disable-next-line no-param-reassign
            prev += "0";
        }
        return prev + val.toString(16);
    }, "");
}

export function decode(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) {
        throw new Error("hex code must be even length");
    }

    const byteLen = hex.length / 2;

    const decodedHex = new Uint8Array(hex.length / 2);
    for (let i = 0; i < byteLen; i += 1) {
        const start = i * 2;
        decodedHex[ i ] = Number.parseInt(hex.slice(start, start + 2), 16);
    }

    return decodedHex;
}
