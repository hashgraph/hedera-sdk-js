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
import CACHE from "./Cache.js";

/**
 * @typedef {import("./PrivateKey.js").default} PrivateKey
 */

/**
 * Multi-word mnemonic phrase (BIP-39).
 *
 * Compatible with the official Hedera mobile
 * wallets (24-words or 22-words) and BRD (12-words).
 */
export default class Mnemonic {
    /**
     * @param {cryptography.Mnemonic} mnemonic
     * @hideconstructor
     * @private
     */
    constructor(mnemonic) {
        this._mnemonic = mnemonic;
    }

    /**
     * Returns a new random 24-word mnemonic from the BIP-39
     * standard English word list.
     *
     * @returns {Promise<Mnemonic>}
     */
    static async generate() {
        return new Mnemonic(await cryptography.Mnemonic._generate(24));
    }

    /**
     * Returns a new random 12-word mnemonic from the BIP-39
     * standard English word list.
     *
     * @returns {Promise<Mnemonic>}
     */
    static async generate12() {
        return new Mnemonic(await cryptography.Mnemonic._generate(12));
    }

    /**
     * Construct a mnemonic from a list of words. Handles 12, 22 (legacy), and 24 words.
     *
     * An exception of BadMnemonicError will be thrown if the mnemonic
     * contains unknown words or fails the checksum. An invalid mnemonic
     * can still be used to create private keys, the exception will
     * contain the failing mnemonic in case you wish to ignore the
     * validation error and continue.
     *
     * @param {string[]} words
     * @throws {BadMnemonicError}
     * @returns {Promise<Mnemonic>}
     */
    static async fromWords(words) {
        return new Mnemonic(await cryptography.Mnemonic.fromWords(words));
    }

    /**
     * Recover a private key from this mnemonic phrase, with an
     * optional passphrase.
     *
     * @param {string} [passphrase]
     * @returns {Promise<PrivateKey>}
     */
    async toPrivateKey(passphrase = "") {
        if (CACHE.privateKeyConstructor == null) {
            throw new Error("`PrivateKey` has not been loaded");
        }

        return CACHE.privateKeyConstructor(
            await this._mnemonic.toPrivateKey(passphrase)
        );
    }

    /**
     * Recover a mnemonic phrase from a string, splitting on spaces. Handles 12, 22 (legacy), and 24 words.
     *
     * @param {string} mnemonic
     * @returns {Promise<Mnemonic>}
     */
    static async fromString(mnemonic) {
        return new Mnemonic(await cryptography.Mnemonic.fromString(mnemonic));
    }

    /**
     * @returns {Promise<PrivateKey>}
     */
    async toLegacyPrivateKey() {
        if (CACHE.privateKeyConstructor == null) {
            throw new Error("`PrivateKey` has not been loaded");
        }

        return CACHE.privateKeyConstructor(
            await this._mnemonic.toLegacyPrivateKey()
        );
    }

    /**
     * @returns {string}
     */
    toString() {
        return this._mnemonic.toString();
    }
}
