import * as bip39 from "bip39";
import * as nacl from "tweetnacl";

// we could go through the whole BS of producing a DER-encoded structure but it's quite simple
// for Ed25519 keys and we don't have to shell out to a potentially broken lib
// https://github.com/PeculiarVentures/pvutils/issues/8
const ed25519KeyPrefix = '302e020100300506032b657004220420';

export function encodeKey(privateKey: Uint8Array): string {
    return privateKey.reduce((prev, val) => {
        if (val < 16) {
            prev += '0';
        }
        return prev + val.toString(16);
    }, ed25519KeyPrefix);
}

export function decodeKey(privateKey: string): Uint8Array {
    if (privateKey.length !== 96 || !privateKey.startsWith(ed25519KeyPrefix)) {
        throw "invalid private key: " + privateKey;
    }

    const decodedHex = new Uint8Array(32);
    for (let i = 0; i < 32; i += 1) {
        const start = 32 + i * 2;
        decodedHex[i] = Number.parseInt(privateKey.slice(start, start + 2), 16);
    }

    return decodedHex;
}

/**
 * Generate a new Ed25519 private/public keypair with DER-encoded private key string and
 * BIP39 mnemonic string
 */
export function generateKeyAndMnemonic(): { secretKey: Uint8Array, publicKey: Uint8Array, keyString: string, mnemonic: string } {
        const keyPair = nacl.sign.keyPair();
        const secretOnly = keyPair.secretKey.slice(0, 32);
        const keyString = encodeKey(secretOnly);
        const mnemonic = bip39.entropyToMnemonic(Buffer.from(secretOnly));

        return { ...keyPair, keyString, mnemonic };
}
