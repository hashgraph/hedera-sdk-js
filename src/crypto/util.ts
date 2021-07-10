import * as crypto from "crypto";
import * as hex from "@stablelib/hex";
import { Hmac, HashAlgorithm } from "./Hmac";
import { Pbkdf2 } from "./Pbkdf2";

// we could go through the whole BS of producing a DER-encoded structure but it's quite simple
// for Ed25519 keys and we don't have to shell out to a potentially broken lib
// https://github.com/PeculiarVentures/pvutils/issues/8
export const ed25519PrivKeyPrefix = "302e020100300506032b657004220420";
export const ed25519PubKeyPrefix = "302a300506032b6570032100";

export const hmacAlgo = "sha384";

/**
 * SLIP-10/BIP-32 child key derivation
 * without using chaincode
 */
export function legacyDeriveChildKey(
    seed: Uint8Array,
    index: number
): Promise<Uint8Array> {
    const password = new Uint8Array(seed.length + 8);
    password.set(seed, 0);

    const view = new DataView(
        password.buffer,
        password.byteOffset + seed.length,
        8
    );
    if (index === 0xFFFFFFFFFF) {
        view.setInt32(0, 0xFF);
        view.setInt32(4, index >>> 32);
    } else {
        view.setInt32(0, index < 0 ? -1 : 0);
        view.setInt32(4, index);
    }

    const salt = Uint8Array.from([ 0xFF ]);
    return Pbkdf2.deriveKey(
        HashAlgorithm.Sha512,
        password,
        salt,
        2048,
        32
    );
}

/** SLIP-10/BIP-32 child key derivation */
export async function deriveChildKey2(
    parentKey: Uint8Array,
    chainCode: Uint8Array,
    index: number
): Promise<{ keyBytes: Uint8Array; chainCode: Uint8Array }> {
    // webpack version of crypto complains if input types are not `Buffer`
    const input = new Uint8Array(37);
    // 0x00 + parentKey + index(BE)
    input[ 0 ] = 0;
    input.set(parentKey, 1);
    new DataView(input.buffer).setUint32(33, index, false);
    // set the index to hardened
    input[ 33 ] |= 128;

    const digest = await Hmac.hash(HashAlgorithm.Sha512, chainCode, input);

    return { keyBytes: digest.subarray(0, 32), chainCode: digest.subarray(32) };
}

/** SLIP-10/BIP-32 child key derivation */
export function deriveChildKey(
    parentKey: Uint8Array,
    chainCode: Uint8Array,
    index: number
): { keyBytes: Uint8Array; chainCode: Uint8Array } {
    // webpack version of crypto complains if input types are not `Buffer`
    const hmac = crypto.createHmac("SHA512", Buffer.from(chainCode));
    const input = new Uint8Array(37);
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

export function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (const [ i, element ] of a.entries()) {
        if (element !== b[ i ]) return false;
    }
    return true;
}
