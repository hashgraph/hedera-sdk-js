import * as crypto from 'crypto';
import * as util from 'util';

import * as bip39 from "bip39";
import {KeyObject, KeyPairKeyObjectResult} from "crypto";

export function encodeKey(key: KeyObject): Buffer {
    return key.export({
        format: 'der',
        type: key.type == 'private' ? 'pkcs8' : 'spki'
    });
}

export function decodeKeyPair(pkeyStr: string): KeyPairKeyObjectResult {
    const privateKey = crypto.createPrivateKey({
        key: Buffer.from(pkeyStr, 'hex'),
        type: 'pkcs8',
        format: 'der',
    });

    const publicKey = crypto.createPublicKey(privateKey);

    return { privateKey, publicKey };
}

const generateKeyPair = util.promisify(crypto.generateKeyPair);

/**
 * Generate a new Ed25519 private/public keypair with DER-encoded private key string and
 * BIP39 mnemonic string
 */
export async function generateKeyAndMnemonic(): Promise<{ privateKey: KeyObject, publicKey: KeyObject, keyString: string, mnemonic: string }> {
    // @ts-ignore @types/node doesn't think the 'ed25519' param is supported
    const keyPair = await generateKeyPair('ed25519');

    const keyBytes = encodeKey(keyPair.privateKey);
    const mnemonic = bip39.entropyToMnemonic(keyBytes.slice(16));

    return { ...keyPair, keyString: keyBytes.toString('hex'), mnemonic };
}
