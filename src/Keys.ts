import * as bip39 from "bip39";
import * as nacl from "tweetnacl";
import * as crypto from 'crypto';
import * as util from 'util';
import {AccountId} from "./Client";
import {Key} from "./generated/BasicTypes_pb";

// we could go through the whole BS of producing a DER-encoded structure but it's quite simple
// for Ed25519 keys and we don't have to shell out to a potentially broken lib
// https://github.com/PeculiarVentures/pvutils/issues/8
const ed25519PrivKeyPrefix = '302e020100300506032b657004220420';
const ed25519PubKeyPrefix = '302a300506032b6570032100';

export class Ed25519PublicKey {
    private readonly keyData: Uint8Array;
    private asString: string | null = null;

    constructor(keyData: Uint8Array) {
        if (keyData.length !== nacl.sign.publicKeyLength) {
            throw new Error('invalid public key');
        }

        this.keyData = keyData;
    }

    static fromString(keyStr: string): Ed25519PublicKey {
        if (keyStr.length !== 88 || !keyStr.startsWith(ed25519PubKeyPrefix)) {
            throw new Error("invalid public key: " + keyStr);
        }

        return new Ed25519PublicKey(decodeHex(keyStr.slice(24)));
    }

    toBytes(): Uint8Array {
        return this.keyData.slice();
    }

    toString(): string {
        if (this.asString === null) {
            this.asString = encodeHex(this.keyData, ed25519PubKeyPrefix);
        }

        return this.asString;
    }

    toProtoKey(): Key {
        const key = new Key();
        // copy the key bytes so they can't modify them through this object
        key.setEd25519(this.toBytes());
        return key;
    }
}

export class Ed25519PrivateKey {
    private readonly keyData: Uint8Array;
    readonly publicKey: Ed25519PublicKey;
    private asString: string | null = null;

    constructor({ privateKey, publicKey }: KeyPair) {
        if (privateKey.length !== nacl.sign.secretKeyLength) {
            throw new Error('invalid private key');
        }

        this.keyData = privateKey;
        this.publicKey = new Ed25519PublicKey(publicKey);
    }

    private static fromSeed(seed: Uint8Array): Ed25519PrivateKey {
        const { secretKey: privateKey, publicKey } =
            // fromSeed takes the private key bytes and calculates the public key
            nacl.sign.keyPair.fromSeed(seed);

        return new Ed25519PrivateKey({ privateKey, publicKey });
    }

    static fromString(keyStr: string): Ed25519PrivateKey {
        if (keyStr.length !== 96 || !keyStr.startsWith(ed25519PrivKeyPrefix)) {
            throw new Error("invalid private key: " + keyStr);
        }

        return this.fromSeed(decodeHex(keyStr.slice(32)));
    }

    /**
     * Recover a key from a 24-word mnemonic string.
     *
     * There is no corresponding `toMnemonic()` as the mnemonic cannot be recovered from the key.
     *
     * Instead, you must generate a mnemonic and a corresponding key in that order with
     * `generateMnemonic()`.
     *
     * @link generateMnemonic
     */
    static async fromMnemonic(mnemonic: string): Promise<Ed25519PrivateKey> {
        return this.generate(decodeHex(bip39.mnemonicToEntropy(mnemonic)));
    }

    /**
     * Recover a private key from a keystore blob previously created by `.createKeystore()`.
     *
     * @param keystore the keystore blob
     * @param passphrase the passphrase used to create the keystore
     * @throws KeyMismatchException if the passphrase is incorrect or the hash fails to validate
     * @link createKeystore
     */
    static async fromKeystore(keystore: Uint8Array, passphrase: string): Promise<Ed25519PrivateKey> {
        return new Ed25519PrivateKey(await loadKeystore(keystore, passphrase));
    }

    /**
     * Generate a private key from 32 bytes of entropy.
     *
     * @param entropy the entropy to use; defaults to 32 cryptographically random bytes
     */
    static async generate(entropy: Uint8Array = crypto.randomBytes(32)): Promise<Ed25519PrivateKey> {
        if (entropy.length !== 32) {
            throw new Error('generating an ed25519 key requires 32 bytes of entropy');
        }

        return this.fromSeed(await deriveSeed(entropy));
    }

    /** Sign the given message with this key. */
    sign(msg: Uint8Array): Uint8Array {
        return nacl.sign(msg, this.keyData);
    }

    toString(): string {
        if (this.asString === null) {
            // only encode the private portion of the private key
            this.asString = encodeHex(this.keyData.subarray(0, 32), ed25519PrivKeyPrefix);
        }

        return this.asString;
    }

    /**
     * Create a keystore blob with a given passphrase.
     *
     * The key can be recovered later with `fromKeystore()`.
     *
     * @link fromKeystore
     */
    createKeystore(passphrase: string): Promise<Uint8Array> {
        return createKeystore(this.keyData, passphrase);
    }
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

export type KeyPair = {
    privateKey: Uint8Array,
    publicKey: Uint8Array
};

/** result of `generateMnemonic()` */
export type MnemonicResult = {
    mnemonic: string,
    /** Lazily generate the key */
    generateKey: () => Promise<Ed25519PrivateKey>;
}

/**
 * Generate a random 24-word mnemonic.
 *
 * If you are happy with the mnemonic produced you can call `.generateKey()` on the returned object.
 *
 * **NOTE:** Mnemonics must be saved separately as they cannot be later recovered from a given key.
 */
export function generateMnemonic(): MnemonicResult {
    const entropy = crypto.randomBytes(32);
    const mnemonic = bip39.entropyToMnemonic(Buffer.from(entropy));
    return { mnemonic, generateKey: () => Ed25519PrivateKey.generate(entropy) };
}

// duplicating what is done here:
// https://github.com/hashgraph/hedera-keygen-java/blob/master/src/main/java/com/hedera/sdk/keygen/CryptoUtils.java#L43
async function deriveSeed(entropy: Uint8Array): Promise<Uint8Array> {
    const password = Buffer.concat([Buffer.from(entropy), Buffer.of(-1, -1, -1, -1, -1, -1, -1, -1)]);
    const salt = Buffer.of(-1);

    return pbkdf2(password, salt, 2048, 32, 'sha512');
}

export type Keystore = {
    version: 1,
    crypto: {
        /** hex-encoded ciphertext */
        ciphertext: string,
        /** hex-encoded initialization vector */
        cipherparams: { iv: string },
        /** cipher being used */
        cipher: 'aes-128-ctr',
        /** key derivation function being used */
        kdf: 'pbkdf2',
        /** params for key derivation function */
        kdfparams: {
            /** derived key length */
            dkLen: number,
            /** hex-encoded salt */
            salt: string,
            /** iteration count */
            c: number,
            /** hash function */
            prf: 'hmac-sha256'
        },
        /** hex-encoded HMAC-SHA384 */
        mac: string,
    }
}

export class KeyMismatchException extends Error {
    readonly hmac: string;
    readonly expectedHmac: string;
    constructor(hmac: Buffer, expectedHmac: Buffer) {
        super('key mismatch when loading from keystore');
        this.hmac = hmac.toString('hex');
        this.expectedHmac = expectedHmac.toString('hex');
    }
}

const hmacAlgo = 'sha384';
async function createKeystore(privateKey: Uint8Array, passphrase: string): Promise<Uint8Array> {
    // all values taken from https://github.com/ethereumjs/ethereumjs-wallet/blob/de3a92e752673ada1d78f95cf80bc56ae1f59775/src/index.ts#L25
    const dkLen = 32;
    const c = 262144;
    const saltLen = 32;
    const salt = crypto.randomBytes(saltLen);

    const key = await pbkdf2(passphrase, salt, c, dkLen, 'sha256');

    const iv = crypto.randomBytes(16);

    // AES-128-CTR with the first half of the derived key and a random IV
    const cipher = crypto.createCipheriv('aes-128-ctr', key.slice(0, 16), iv);

    const cipherText = Buffer.concat([cipher.update(privateKey), cipher.final()]);

    const mac = crypto.createHmac(hmacAlgo, key.slice(16)).update(cipherText).digest();

    const keystore: Keystore = {
        version: 1,
        crypto: {
            ciphertext: cipherText.toString('hex'),
            cipherparams: { iv: iv.toString('hex') },
            cipher: 'aes-128-ctr',
            kdf: 'pbkdf2',
            kdfparams: {
                dkLen,
                salt: salt.toString('hex'),
                c,
                prf: 'hmac-sha256'
            },
            mac: mac.toString('hex')
        },
    };

    return Buffer.from(JSON.stringify(keystore));
}

async function loadKeystore(keystoreBytes: Uint8Array, passphrase: string): Promise<KeyPair> {
    const keystore: Keystore = JSON.parse(Buffer.from(keystoreBytes).toString());

    if (keystore.version !== 1) {
        throw new Error ('unsupported keystore version: ' + keystore.version);
    }

    const { ciphertext, cipherparams: { iv }, cipher, kdf, kdfparams: { dkLen, salt, c, prf }, mac }
        = keystore.crypto;

    if (kdf !== 'pbkdf2') {
        throw new Error('unsupported key derivation function: ' + kdf);
    }

    if (prf !== 'hmac-sha256') {
        throw new Error('unsupported key derivation hash function: ' + prf);
    }

    const saltBytes = Buffer.from(salt, 'hex');
    const ivBytes = Buffer.from(iv, 'hex');
    const cipherBytes = Buffer.from(ciphertext, 'hex');

    const key = await pbkdf2(passphrase, saltBytes, c, dkLen, 'sha256');

    const hmac = Buffer.from(mac, 'hex');
    const verifyHmac = crypto.createHmac(hmacAlgo, key.slice(16)).update(cipherBytes).digest();

    if (!hmac.equals(verifyHmac)) {
        throw new KeyMismatchException(hmac, verifyHmac);
    }

    const decipher = crypto.createDecipheriv(cipher, key.slice(0, 16), ivBytes);
    const privateKeyBytes = Buffer.concat([decipher.update(cipherBytes), decipher.final()]);

    // `Buffer instanceof Uint8Array` doesn't work in Jest because the prototype chain is different
    const { secretKey: privateKey, publicKey } = nacl.sign.keyPair.fromSecretKey(Uint8Array.from(privateKeyBytes));
    return { privateKey, publicKey };
}
