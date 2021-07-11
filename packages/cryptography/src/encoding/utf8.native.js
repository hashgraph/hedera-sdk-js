// @ts-ignore
import encodeAndDecodeModule from "fastestsmallesttextencoderdecoder";

/**
 * @param {Uint8Array} data
 * @returns {string}
 */
export function decode(data) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return encodeAndDecodeModule.decode(data);
}

/**
 * @param {string} text
 * @returns {Uint8Array}
 */
export function encode(text) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return encodeAndDecodeModule.encode(text);
}
