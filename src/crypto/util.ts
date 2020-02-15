import * as crypto from "crypto";
import { promisify } from "util";

export const pbkdf2 = promisify(crypto.pbkdf2);
export const randomBytes = promisify(crypto.randomBytes);
export const errorIndexes = [ -1, -1 ]; // need this to simplify error checking in Ed25519PrivateKey.fromPem()

// we could go through the whole BS of producing a DER-encoded structure but it's quite simple
// for Ed25519 keys and we don't have to shell out to a potentially broken lib
// https://github.com/PeculiarVentures/pvutils/issues/8
export const ed25519PrivKeyPrefix = "302e020100300506032b657004220420";
export const ed25519PubKeyPrefix = "302a300506032b6570032100";

export const hmacAlgo = "sha384";

export function encodeHex(bytes: Uint8Array): string {
    return bytes.reduce((prev, val) => {
        if (val < 16) {
            // eslint-disable-next-line no-param-reassign
            prev += "0";
        }
        return prev + val.toString(16);
    }, "");
}

export function decodeHex(hex: string): Uint8Array {
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

/** SLIP-10/BIP-32 child key derivation */
export function deriveChildKey(
    parentKey: Uint8Array,
    chainCode: Uint8Array,
    index: number
): { keyBytes: Uint8Array; chainCode: Uint8Array } {
    // webpack version of crypto complains if input types are not `Buffer`
    const hmac = crypto.createHmac("SHA512", Buffer.from(chainCode));
    const input = Buffer.alloc(37);
    // 0x00 + parentKey + index(BE)
    input[ 0 ] = 0;
    input.set(parentKey, 1);
    new DataView(input.buffer).setUint32(33, index, false);
    // set the index to hardened
    input[ 33 ] |= 128;

    hmac.update(input);

    const digest = hmac.digest();

    return { keyBytes: digest.subarray(0, 32), chainCode: digest.subarray(32) };
}

export function findSubarray(array: Uint8Array, subArray: Uint8Array): number[] {
    for (let i = 0; i < array.length; i += 1) {
        if (subArray[ 0 ] === array[ i ]) {
            for (let j = 1; j < subArray.length; j += 1) {
                if (subArray[ j ] !== array[ i + j ]) {
                    break;
                }
                if (j === subArray.length - 1) {
                    return [ i, i + j ];
                }
            }
        }
    }
    return errorIndexes; // returns [ -1, -1 ] on failure
}

export function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (const [ i, element ] of a.entries()) {
        if (element !== b[ i ]) return false;
    }
    return true;
}
