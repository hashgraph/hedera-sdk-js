import * as bip39 from "bip39";
import * as nacl from "tweetnacl";
import * as crypto from 'crypto';
import * as util from 'util';

// we could go through the whole BS of producing a DER-encoded structure but it's quite simple
// for Ed25519 keys and we don't have to shell out to a potentially broken lib
// https://github.com/PeculiarVentures/pvutils/issues/8
const ed25519PrivKeyPrefix = '302e020100300506032b657004220420';
const ed25519PubKeyPrefix = '302a300506032b6570032100';

export const encodePrivateKey = (privateKey: Uint8Array): string =>
    encodeHex(privateKey, ed25519PrivKeyPrefix);

export const encodePublicKey = (publicKey: Uint8Array): string =>
    encodeHex(publicKey, ed25519PubKeyPrefix);

export function decodePrivateKey(keyStr: string): KeyPair {
    if (keyStr.length !== 96 || !keyStr.startsWith(ed25519PrivKeyPrefix)) {
        throw "invalid private key: " + keyStr;
    }

    const { secretKey: privateKey, publicKey } =
        nacl.sign.keyPair.fromSeed(decodeHex(keyStr.slice(32)));

    return { privateKey, publicKey };
}

function encodeHex(bytes: Uint8Array, prefix: string): string {
    return bytes.reduce((prev, val) => {
        if (val < 16) {
            prev += '0';
        }
        return prev + val.toString(16);
    }, prefix);
}

function decodeHex(hex: String): Uint8Array {
    if (hex.length % 2 != 0) {
        throw Error('hex code must be even length');
    }

    const byteLen = hex.length / 2;

    const decodedHex = new Uint8Array(hex.length / 2);
    for (let i = 0; i < byteLen; i += 1) {
        const start = i * 2;
        decodedHex[i] = Number.parseInt(hex.slice(start, start + 2), 16);
    }

    return decodedHex;
}

const pbkdf2 = util.promisify(crypto.pbkdf2);

export type KeyResult = {
    /** Private key used to sign transactions */
    privateKey: Uint8Array,
    /** Public key to send to the network */
    publicKey: Uint8Array,
    /** DER encoded private key for use with `decodeKey()` */
    keyString: string,
}

export type KeyPair = {
    privateKey: Uint8Array,
    publicKey: Uint8Array
};

export type MnemonicResult = {
    mnemonic: string,
    /** Lazily generate the key */
    generateKey: () => Promise<KeyResult>;
}

/** Generate a random mnemonic */
export function generateMnemonic(): MnemonicResult {
    const entropy = crypto.randomBytes(32);
    const mnemonic = bip39.entropyToMnemonic(Buffer.from(entropy));
    return { mnemonic, generateKey: () => generateKey(entropy) };
}

/**
 * Generate a new Ed25519 private/public keypair with DER-encoded private key string and
 * BIP39 mnemonic string
 */
export async function generateKey(entropy: Uint8Array): Promise<KeyResult> {
    if (entropy.length !== 32) {
        throw new Error('generating an ed25519 key requires 32 bytes of entropy');
    }

    const keyPair = await keyFromEntropy(entropy);
    const keyString = encodePrivateKey(keyPair.privateKey);

    return { ...keyPair, keyString };
}

/** Recover a keypair from a mnemonic sentence */
export async function keyFromMnemonic(mnemonic: string): Promise<KeyPair> {
    const entropy = decodeHex(bip39.mnemonicToEntropy(mnemonic));
    return keyFromEntropy(entropy);
}

async function keyFromEntropy(entropy: Uint8Array): Promise<KeyPair> {
    if (entropy.length !== 32) {
        throw Error('entropy length must be 32 bytes');
    }

    const seed = await deriveSeed(entropy);
    const { secretKey: privateKey, publicKey } = nacl.sign.keyPair.fromSeed(new Uint8Array(seed));

    return { privateKey, publicKey };
}

// duplicating what is done here:
// https://github.com/hashgraph/hedera-keygen-java/blob/master/src/main/java/com/hedera/sdk/keygen/CryptoUtils.java#L43
async function deriveSeed(entropy: Uint8Array): Promise<Uint8Array> {
    const password = new Uint8Array(40);
    password.set(entropy, 0);
    const postfix = Uint8Array.of(-1, -1, -1, -1, -1, -1, -1, -1);
    password.set(postfix, 32);

    const salt = Uint8Array.of(-1);

    return pbkdf2(password, salt, 2048, 32, 'sha512');
}

export type Keystore = {
    crypto: {

    }
}

export async function createKeystore(privateKey: Uint8Array, passphrase: string): Promise<Keystore> {
    // all values taken from https://github.com/ethereumjs/ethereumjs-wallet/blob/de3a92e752673ada1d78f95cf80bc56ae1f59775/src/index.ts#L25
    const key = await pbkdf2(passphrase, nacl.randomBytes(32), 262144, 32, 'sha256');

    const iv = crypto.randomBytes(16);

    // AES-128-CTR with the first half of the derived key and a random IV
    const cipher = crypto.createCipheriv('aes-128-ctr', key.slice(0, 16), iv);

    const cipherText = Buffer.concat([cipher.update(privateKey), cipher.final()]);

    const mac = crypto.createHmac('sha384', key.slice(16)).update(cipherText).digest();
}
