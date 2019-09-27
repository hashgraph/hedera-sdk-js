import * as bip39 from "bip39";
import * as nacl from "tweetnacl";
import * as crypto from 'crypto';
import * as util from 'util';
import {Key, KeyList, ThresholdKey as ThresholdKeyProto} from "./generated/BasicTypes_pb";

const pbkdf2 = util.promisify(crypto.pbkdf2);

// we could go through the whole BS of producing a DER-encoded structure but it's quite simple
// for Ed25519 keys and we don't have to shell out to a potentially broken lib
// https://github.com/PeculiarVentures/pvutils/issues/8
const ed25519PrivKeyPrefix = '302e020100300506032b657004220420';
const ed25519PubKeyPrefix = '302a300506032b6570032100';

/**
 * BIP-44 key derivation options as described here:
 * https://github.com/bitcoin/bips/blob/33e6283/bip-0044.mediawiki#account
 *
 * `purpose = "44"` and `coin = "3030" (Hedera HBAR)` are hardcoded.
 */
export type DeriveOpts = {
    account: number;
    change: number;
    index: number;
}

export class Ed25519PublicKey implements PublicKey {
    private readonly _keyData: Uint8Array;
    private _asStringRaw?: string;

    public constructor(keyData: Uint8Array) {
        if (keyData.length !== nacl.sign.publicKeyLength) {
            throw new Error('invalid public key');
        }

        this._keyData = keyData;
    }

    public static fromString(keyStr: string): Ed25519PublicKey {
        switch (keyStr.length) {
            case 64: { // raw public key
                const newKey = new Ed25519PublicKey(decodeHex(keyStr));
                newKey._asStringRaw = keyStr;
                return newKey;
            }
            case 88: // DER encoded public key
                if (keyStr.startsWith(ed25519PubKeyPrefix)) {
                    const rawKey = keyStr.slice(24);
                    const newKey = new Ed25519PublicKey(decodeHex(rawKey));
                    newKey._asStringRaw = rawKey;
                    return newKey;
                }
                break;
            default:
        }

        throw new Error("invalid public key: " + keyStr);
    }

    public toBytes(): Uint8Array {
        return this._keyData.slice();
    }

    public toString(raw = false): string {
        if (!this._asStringRaw) {
            this._asStringRaw = encodeHex(this._keyData);
        }

        return (raw ? '' : ed25519PubKeyPrefix) + this._asStringRaw;
    }

    public _toProtoKey(): Key {
        const key = new Key();
        // copy the key bytes so they can't modify them through this object
        key.setEd25519(this.toBytes());
        return key;
    }
}

export class Ed25519PrivateKey {
    private readonly _keyData: Uint8Array;
    private _asStringRaw?: string;
    private _chainCode?: Uint8Array;

    public readonly publicKey: Ed25519PublicKey;

    private constructor({ privateKey, publicKey }: RawKeyPair) {
        if (privateKey.length !== nacl.sign.secretKeyLength) {
            throw new Error('invalid private key');
        }

        this._keyData = privateKey;
        this.publicKey = new Ed25519PublicKey(publicKey);
    }

    /**
     * Recover a private key from its raw bytes form.
     *
     * This key will _not_ support child key derivation.
     */
    public static fromBytes(bytes: Uint8Array): Ed25519PrivateKey {
        // this check is necessary because Jest breaks the prototype chain of Uint8Array
        // noinspection SuspiciousTypeOfGuard
        const bytesArray = bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes);
        let keypair;

        switch (bytes.length) {
            case 32:
                // fromSeed takes the private key bytes and calculates the public key
                keypair = nacl.sign.keyPair.fromSeed(bytesArray);
                break;
            case 64:
                // priv + pub key pair
                keypair = nacl.sign.keyPair.fromSecretKey(bytesArray);
                break;
            default:
                throw new Error("invalid private key");
        }

        const { secretKey: privateKey, publicKey } = keypair;

        return new Ed25519PrivateKey({ privateKey, publicKey });
    }

    /**
     * Recover a key from a hex-encoded string.
     *
     * This key will _not_ support child key derivation.
     */
    public static fromString(keyStr: string): Ed25519PrivateKey {
        switch (keyStr.length) {
            case 64: // lone private key
            case 128: { // private key + public key
                const newKey = Ed25519PrivateKey.fromBytes(decodeHex(keyStr));
                newKey._asStringRaw = keyStr;
                return newKey;
            }
            case 96:
                if (keyStr.startsWith(ed25519PrivKeyPrefix)) {
                    const rawStr = keyStr.slice(32);
                    const newKey = Ed25519PrivateKey.fromBytes(decodeHex(rawStr))
                    newKey._asStringRaw = rawStr;
                    return newKey;
                }
                break;
            default:
        }
        throw new Error("invalid private key: " + keyStr);
    }

    /**
     * Recover a key from a 24-word mnemonic.
     *
     * There is no corresponding `toMnemonic()` as the mnemonic cannot be recovered from the key.
     *
     * Instead, you must generate a mnemonic and a corresponding key in that order with
     * `generateMnemonic()`.
     *
     * This accepts mnemonics generated by the Android and iOS mobile wallets.
     *
     * This key *will* support deriving child keys with `.derive()`.
     *
     * @param mnemonic the mnemonic, either as a string separated by spaces or as a 24-element array
     * @param passphrase the passphrase to protect the private key with
     *
     * @link generateMnemonic
     */
    public static async fromMnemonic(mnemonic: string | string[], passphrase?: string): Promise<Ed25519PrivateKey> {
        const input = Array.isArray(mnemonic) ? mnemonic.join(' ') : mnemonic;
        const salt = `mnemonic${passphrase || ''}`;
        const seed = await pbkdf2(input, salt, 2048, 64, 'sha512');

        const hmac = crypto.createHmac('sha512', 'ed25519 seed');
        hmac.update(seed);

        const digest = hmac.digest();

        let keyBytes: Uint8Array = digest.subarray(0, 32);
        let chainCode: Uint8Array = digest.subarray(32);

        for (const index of [44, 3030, 0, 0]) {
            ({ keyBytes, chainCode } = deriveChildKey(keyBytes, chainCode, index));
        }

        const key = Ed25519PrivateKey.fromBytes(keyBytes);
        key._chainCode = chainCode;
        return key;
    }

    /**
     * Recover a private key from a keystore blob previously created by `.createKeystore()`.
     *
     * This key will _not_ support child key derivation.
     *
     * @param keystore the keystore blob
     * @param passphrase the passphrase used to create the keystore
     * @throws KeyMismatchException if the passphrase is incorrect or the hash fails to validate
     * @link createKeystore
     */
    public static async fromKeystore(keystore: Uint8Array, passphrase: string): Promise<Ed25519PrivateKey> {
        return new Ed25519PrivateKey(await loadKeystore(keystore, passphrase));
    }

    /**
     * Generate a new, cryptographically random private key.
     *
     * This key will _not_ support child key derivation.
     */
    public static async generate(): Promise<Ed25519PrivateKey> {
        return this.fromBytes(crypto.randomBytes(32));
    }

    /**
     * Derive a new private key at the given wallet index.
     *
     * Only currently supported for keys created with `fromMnemonic()`; other keys will throw
     * an error.
     *
     * You can check if a key supports derivation with `.supportsDerivation`
     */
    public derive(index: number): Ed25519PrivateKey {
        if (!this._chainCode) {
            throw new Error('this Ed25519 private key does not support key derivation');
        }

        const { keyBytes, chainCode } = deriveChildKey(this._keyData.subarray(0, 32), this._chainCode, index);
        const key = Ed25519PrivateKey.fromBytes(keyBytes);
        key._chainCode = chainCode;
        return key;
    }

    /** Check if this private key supports deriving child keys */
    public get supportsDerivation(): boolean {
        return !!this._chainCode;
    }

    /** Sign the given message with this key. */
    public sign(msg: Uint8Array): Uint8Array {
        return nacl.sign(msg, this._keyData);
    }

    public toBytes(): Uint8Array {
        // copy the bytes so they can't be modified accidentally
        // only copy the private key portion since that's what we're expecting on the other end
        return this._keyData.slice(0, 32);
    }

    public toString(raw = false): string {
        if (!this._asStringRaw) {
            // only encode the private portion of the private key
            this._asStringRaw = encodeHex(this._keyData.subarray(0, 32));
        }

        return (raw ? '' : ed25519PrivKeyPrefix) + this._asStringRaw;
    }

    /**
     * Create a keystore blob with a given passphrase.
     *
     * The key can be recovered later with `fromKeystore()`.
     *
     * Note that this will not retain the ancillary data used for deriving child keys,
     * thus `.derive()` on the restored key will throw even if this instance supports derivation.
     *
     * @link fromKeystore
     */
    public createKeystore(passphrase: string): Promise<Uint8Array> {
        return createKeystore(this._keyData, passphrase);
    }
}

/** SLIP-10/BIP-32 child key derivation */
function deriveChildKey(parentKey: Uint8Array, chainCode: Uint8Array, index: number): { keyBytes: Uint8Array; chainCode: Uint8Array } {
    // webpack version of crypto complains if input types are not `Buffer`
    const hmac = crypto.createHmac('SHA512', Buffer.from(chainCode));
    const input = Buffer.alloc(37);
    // 0x00 + parentKey + index(BE)
    input[0] = 0;
    input.set(parentKey, 1);
    new DataView(input.buffer).setUint32(33, index, false);
    // set the index to hardened
    input[33] = input[33] | 128;

    hmac.update(input);

    const digest = hmac.digest();

    return { keyBytes: digest.subarray(0, 32), chainCode: digest.subarray(32) }
}

export interface PublicKey {
    _toProtoKey(): Key;
}

export class ThresholdKey implements PublicKey {
    private readonly _threshold: number;
    private readonly _keys: Key[] = [];

    public constructor(threshold: number) {
        this._threshold = threshold;
    }

    public add(key: PublicKey): this {
        this._keys.push(key._toProtoKey());
        return this;
    }

    public addAll(...keys: PublicKey[]): this {
        this._keys.push(...keys.map((key) => key._toProtoKey()));
        return this;
    }

    public _toProtoKey(): Key {
        if (this._keys.length === 0) {
            throw new Error("ThresholdKey must have at least one key");
        }

        if (this._threshold > this._keys.length) {
            throw new Error('ThresholdKey must have at least as many keys as threshold: '
                + `${this._threshold}; # of keys currently: ${this._keys.length}`);
        }

        const keyList = new KeyList();
        keyList.setKeysList(this._keys);

        const thresholdKey = new ThresholdKeyProto();
        thresholdKey.setThreshold(this._threshold);
        thresholdKey.setKeys(keyList);

        const protoKey = new Key();
        protoKey.setThresholdkey(thresholdKey);

        return protoKey;
    }
}

function encodeHex(bytes: Uint8Array): string {
    return bytes.reduce((prev, val) => {
        if (val < 16) {
            prev += '0';
        }
        return prev + val.toString(16);
    }, '');
}

function decodeHex(hex: string): Uint8Array {
    if (hex.length % 2 != 0) {
        throw new Error('hex code must be even length');
    }

    const byteLen = hex.length / 2;

    const decodedHex = new Uint8Array(hex.length / 2);
    for (let i = 0; i < byteLen; i += 1) {
        const start = i * 2;
        decodedHex[i] = Number.parseInt(hex.slice(start, start + 2), 16);
    }

    return decodedHex;
}

export type RawKeyPair = {
    /** 32-byte raw Ed25519 private key */
    privateKey: Uint8Array;
    /** 32-byte raw Ed25519 public key */
    publicKey: Uint8Array;
};

/** result of `generateMnemonic()` */
export type MnemonicResult = {
    mnemonic: string;
    /** Lazily generate the key, providing an optional passphrase to protect it with */
    generateKey: (passphrase?: string) => Promise<Ed25519PrivateKey>;
}

/**
 * Generate a random 24-word mnemonic.
 *
 * If you are happy with the mnemonic produced you can call `.generateKey()` on the returned object.
 *
 * This mnemonics that are compatible with the Android and iOS mobile wallets.
 *
 * **NOTE:** Mnemonics must be saved separately as they cannot be later recovered from a given key.
 */
export function generateMnemonic(): MnemonicResult {
    // 256-bit entropy gives us 24 words
    const mnemonic = bip39.generateMnemonic(256);
    return { mnemonic, generateKey: (passphrase) => Ed25519PrivateKey.fromMnemonic(mnemonic, passphrase) };
}

export type Keystore = {
    version: 1;
    crypto: {
        /** hex-encoded ciphertext */
        ciphertext: string;
        /** hex-encoded initialization vector */
        cipherparams: { iv: string };
        /** cipher being used */
        cipher: 'aes-128-ctr';
        /** key derivation function being used */
        kdf: 'pbkdf2';
        /** params for key derivation function */
        kdfparams: {
            /** derived key length */
            dkLen: number;
            /** hex-encoded salt */
            salt: string;
            /** iteration count */
            c: number;
            /** hash function */
            prf: 'hmac-sha256';
        };
        /** hex-encoded HMAC-SHA384 */
        mac: string;
    };
}

export class KeyMismatchException extends Error {
    private readonly _hmac: string;
    private readonly _expectedHmac: string;

    public constructor(hmac: Buffer, expectedHmac: Buffer) {
        super('key mismatch when loading from keystore');
        this._hmac = hmac.toString('hex');
        this._expectedHmac = expectedHmac.toString('hex');
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

async function loadKeystore(keystoreBytes: Uint8Array, passphrase: string): Promise<RawKeyPair> {
    const keystore: Keystore = JSON.parse(Buffer.from(keystoreBytes).toString());

    if (keystore.version !== 1) {
        throw new Error('unsupported keystore version: ' + keystore.version);
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
