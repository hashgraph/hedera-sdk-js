import * as hmac from "./hmac.js";
import * as hex from "../encoding/hex.js";
import elliptic from "elliptic";

const secp256k1 = new elliptic.ec("secp256k1");

const HIGHEST_BIT = 0x80000000;

/**
 * Mostly copied from https://github.com/bitcoinjs/bip32/blob/master/ts-src/bip32.ts
 * We cannot use that library directly because it uses `Buffer` and we want to avoid
 * polyfills as much as possible. Also, we only need the `derive` function.
 *
 * @param {Uint8Array} parentKey
 * @param {Uint8Array} chainCode
 * @param {number} index
 * @returns {Promise<{ keyData: Uint8Array; chainCode: Uint8Array }>}
 */
export async function derive(parentKey, chainCode, index) {
    const isHardened = (index & HIGHEST_BIT) !== 0;
    const data = new Uint8Array(37);

    const publicKey = hex.decode(
        secp256k1.keyFromPrivate(parentKey).getPublic(true, "hex")
    );

    // Hardened child
    if (isHardened) {
        // data = 0x00 || ser256(kpar) || ser32(index)
        data[0] = 0x00;
        data.set(parentKey, 1);

        // Normal child
    } else {
        // data = serP(point(kpar)) || ser32(index)
        //      = serP(Kpar) || ser32(index)
        data.set(publicKey, 0);
    }

    new DataView(data.buffer, data.byteOffset, data.byteLength).setUint32(
        33,
        index,
        false
    );

    const I = await hmac.hash(hmac.HashAlgorithm.Sha512, chainCode, data);
    const IL = I.subarray(0, 32);
    const IR = I.subarray(32);

    // if parse256(IL) >= n, proceed with the next value for i
    try {
        // ki = parse256(IL) + kpar (mod n)
        const ki = secp256k1
            .keyFromPrivate(parentKey)
            .getPrivate()
            .add(secp256k1.keyFromPrivate(IL).getPrivate());
        // const ki = Buffer.from(ecc.privateAdd(this.privateKey!, IL)!);

        // In case ki == 0, proceed with the next value for i
        if (ki.eqn(0)) {
            return derive(parentKey, chainCode, index + 1);
        }

        return {
            keyData: hex.decode(
                secp256k1.keyFromPrivate(ki.toArray()).getPrivate("hex")
            ),
            chainCode: IR,
        };
    } catch {
        return derive(parentKey, chainCode, index + 1);
    }
}
