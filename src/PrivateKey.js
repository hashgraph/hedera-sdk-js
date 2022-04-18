/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2022 Hedera Hashgraph, LLC
 * ​
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ‍
 */

import * as cryptography from "@hashgraph/cryptography";
import Mnemonic from "./Mnemonic.js";
import PublicKey from "./PublicKey.js";
import Key from "./Key.js";
import CACHE from "./Cache.js";

/**
 * @typedef {import("./transaction/Transaction.js").default} Transaction
 * @typedef {import("./account/AccountId.js").default} AccountId
 */

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IKey} HashgraphProto.proto.IKey
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HashgraphProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignaturePair} HashgraphProto.proto.ISignaturePair
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HashgraphProto.proto.ISignedTransaction
 */

export default class PrivateKey extends Key {
    /**
     * @internal
     * @hideconstructor
     * @param {cryptography.PrivateKey} key
     */
    constructor(key) {
        super();

        this._key = key;
    }

    /**
     * Generate a random Ed25519 private key.
     *
     * @returns {PrivateKey}
     */
    static generateED25519() {
        return new PrivateKey(cryptography.PrivateKey.generateED25519());
    }

    /**
     * Generate a random EDSA private key.
     *
     * @returns {PrivateKey}
     */
    static generateECDSA() {
        return new PrivateKey(cryptography.PrivateKey.generateECDSA());
    }

    /**
     * Depredated - Use `generateEd25519()` instead
     * Generate a random Ed25519 private key.
     *
     * @returns {PrivateKey}
     */
    static generate() {
        return PrivateKey.generateED25519();
    }

    /**
     * Depredated - Use `generateEd25519Async()` instead
     * Generate a random Ed25519 private key.
     *
     * @returns {Promise<PrivateKey>}
     */
    static async generateAsync() {
        return new PrivateKey(await cryptography.PrivateKey.generateAsync());
    }

    /**
     * Generate a random Ed25519 private key.
     *
     * @returns {Promise<PrivateKey>}
     */
    static async generateED25519Async() {
        return new PrivateKey(
            await cryptography.PrivateKey.generateED25519Async()
        );
    }

    /**
     * Generate a random ECDSA private key.
     *
     * @returns {Promise<PrivateKey>}
     */
    static async generateECDSAAsync() {
        return new PrivateKey(
            await cryptography.PrivateKey.generateECDSAAsync()
        );
    }

    /**
     * Construct a private key from bytes. Requires DER header.
     *
     * @param {Uint8Array} data
     * @returns {PrivateKey}
     */
    static fromBytes(data) {
        return new PrivateKey(cryptography.PrivateKey.fromBytes(data));
    }

    /**
     * Construct a ECDSA private key from bytes.
     *
     * @param {Uint8Array} data
     * @returns {PrivateKey}
     */
    static fromBytesECDSA(data) {
        return new PrivateKey(cryptography.PrivateKey.fromBytesECDSA(data));
    }

    /**
     * Construct a ED25519 private key from bytes.
     *
     * @param {Uint8Array} data
     * @returns {PrivateKey}
     */
    static fromBytesED25519(data) {
        return new PrivateKey(cryptography.PrivateKey.fromBytesED25519(data));
    }

    /**
     * Construct a private key from a hex-encoded string. Requires DER header.
     *
     * @param {string} text
     * @returns {PrivateKey}
     */
    static fromString(text) {
        return new PrivateKey(cryptography.PrivateKey.fromString(text));
    }

    /**
     * Construct a ECDSA private key from a hex-encoded string.
     *
     * @param {string} text
     * @returns {PrivateKey}
     */
    static fromStringECDSA(text) {
        return new PrivateKey(cryptography.PrivateKey.fromStringECDSA(text));
    }

    /**
     * Construct a Ed25519 private key from a hex-encoded string.
     *
     * @param {string} text
     * @returns {PrivateKey}
     */
    static fromStringED25519(text) {
        return new PrivateKey(cryptography.PrivateKey.fromStringED25519(text));
    }

    /**
     * Recover a private key from a mnemonic phrase (and optionally a password).
     *
     * @param {Mnemonic | cryptography.Mnemonic | string} mnemonic
     * @param {string} [passphrase]
     * @returns {Promise<PrivateKey>}
     */
    static async fromMnemonic(mnemonic, passphrase = "") {
        if (mnemonic instanceof Mnemonic) {
            return new PrivateKey(
                await cryptography.PrivateKey.fromMnemonic(
                    mnemonic._mnemonic,
                    passphrase
                )
            );
        }

        return new PrivateKey(
            await cryptography.PrivateKey.fromMnemonic(mnemonic, passphrase)
        );
    }

    /**
     * Recover a private key from a keystore, previously created by `.toKeystore()`.
     *
     * This key will _not_ support child key derivation.
     *
     * @param {Uint8Array} data
     * @param {string} [passphrase]
     * @returns {Promise<PrivateKey>}
     * @throws {BadKeyError} If the passphrase is incorrect or the hash fails to validate.
     */
    static async fromKeystore(data, passphrase = "") {
        return new PrivateKey(
            await cryptography.PrivateKey.fromKeystore(data, passphrase)
        );
    }

    /**
     * Recover a private key from a pem string; the private key may be encrypted.
     *
     * This method assumes the .pem file has been converted to a string already.
     *
     * If `passphrase` is not null or empty, this looks for the first `ENCRYPTED PRIVATE KEY`
     * section and uses `passphrase` to decrypt it; otherwise, it looks for the first `PRIVATE KEY`
     * section and decodes that as a DER-encoded  private key.
     *
     * @param {string} data
     * @param {string} [passphrase]
     * @returns {Promise<PrivateKey>}
     */
    static async fromPem(data, passphrase = "") {
        return new PrivateKey(
            await cryptography.PrivateKey.fromPem(data, passphrase)
        );
    }

    /**
     * Derive a new private key at the given wallet index.
     *
     * Only currently supported for keys created with `fromMnemonic()`; other keys will throw
     * an error.
     *
     * You can check if a key supports derivation with `.supportsDerivation()`
     *
     * @param {number} index
     * @returns {Promise<PrivateKey>}
     * @throws If this key does not support derivation.
     */
    async derive(index) {
        return new PrivateKey(await this._key.derive(index));
    }

    /**
     * @param {number} index
     * @returns {Promise<PrivateKey>}
     * @throws If this key does not support derivation.
     */
    async legacyDerive(index) {
        return new PrivateKey(await this._key.legacyDerive(index));
    }

    /**
     * Get the public key associated with this private key.
     *
     * The public key can be freely given and used by other parties to verify
     * the signatures generated by this private key.
     *
     * @returns {PublicKey}
     */
    get publicKey() {
        return new PublicKey(this._key.publicKey);
    }

    /**
     * Sign a message with this private key.
     *
     * @param {Uint8Array} bytes
     * @returns {Uint8Array} - The signature bytes without the message
     */
    sign(bytes) {
        return this._key.sign(bytes);
    }

    /**
     * @param {Transaction} transaction
     * @returns {Uint8Array}
     */
    signTransaction(transaction) {
        const tx = transaction._signedTransactions.get(0);
        const signature =
            tx.bodyBytes != null ? this.sign(tx.bodyBytes) : new Uint8Array();

        transaction.addSignature(this.publicKey, signature);

        return signature;
    }

    /**
     * Check if `derive` can be called on this private key.
     *
     * This is only the case if the key was created from a mnemonic.
     *
     * @returns {boolean}
     */
    isDerivable() {
        return this._key.isDerivable();
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return this._key.toBytes();
    }

    /**
     * @returns {Uint8Array}
     */
    toBytesDer() {
        return this._key.toBytesDer();
    }

    /**
     * @returns {Uint8Array}
     */
    toBytesRaw() {
        return this._key.toBytesRaw();
    }

    /**
     * @returns {string}
     */
    toString() {
        return this._key.toStringDer();
    }

    /**
     * @returns {string}
     */
    toStringDer() {
        return this._key.toStringDer();
    }

    /**
     * @returns {string}
     */
    toStringRaw() {
        return this._key.toStringRaw();
    }

    /**
     * Create a keystore with a given passphrase.
     *
     * The key can be recovered later with `fromKeystore()`.
     *
     * Note that this will not retain the ancillary data used for
     * deriving child keys, thus `.derive()` on the restored key will
     * throw even if this instance supports derivation.
     *
     * @param {string} [passphrase]
     * @returns {Promise<Uint8Array>}
     */
    toKeystore(passphrase = "") {
        return this._key.toKeystore(passphrase);
    }

    /**
     * @returns {HashgraphProto.proto.IKey}
     */
    _toProtobufKey() {
        return this.publicKey._toProtobufKey();
    }

    /**
     * @param {Long | number} shard
     * @param {Long | number} realm
     * @returns {AccountId}
     */
    toAccountId(shard, realm) {
        return this.publicKey.toAccountId(shard, realm);
    }
}

CACHE.privateKeyConstructor = (key) => new PrivateKey(key);
