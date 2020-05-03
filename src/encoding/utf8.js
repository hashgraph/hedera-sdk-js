
// node < v12 does not have TextEncoder or TextDecoder on the global object
// if we don't find it on global, assume that we're node < 12

/* eslint-disable node/no-unsupported-features/node-builtins */

const Utf8Encoder = typeof TextEncoder === 'undefined'
    ? require("util").TextEncoder : TextEncoder;

const Utf8Decoder = typeof TextDecoder === 'undefined'
    ? require("util").TextDecoder : TextDecoder;

/* eslint-enable node/no-unsupported-features/node-builtins */

const encoder = new Utf8Encoder();
const decoder = new Utf8Decoder();


/**
 * @param {string} s
 * @returns {Uint8Array}
 */
export function encode(s) {
    return encoder.encode(s);
}

/**
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function decode(bytes) {
    return decoder.decode(bytes);
}
