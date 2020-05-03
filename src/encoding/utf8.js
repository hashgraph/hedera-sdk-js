
// node < v12 does not have TextEncoder or TextDecoder on the global object
// if we don't find it on global, assume that we're node < 12

const Utf8Encoder = typeof TextEncoder === 'undefined'
    ? require("util").TextEncoder : TextEncoder;

const Utf8Decoder = typeof TextDecoder === 'undefined'
    ? require("util").TextDecoder : TextDecoder;

const encoder = new Utf8Encoder();
const decoder = new Utf8Decoder();

export function encode(s) {
    return encoder.encode(s);
}

export function decode(bytes) {
    return decoder.decode(bytes);
}
