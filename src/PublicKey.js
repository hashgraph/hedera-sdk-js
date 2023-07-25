/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2023 Hedera Hashgraph, LLC
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
import { arrayEqual } from "./array.js";
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

export default class PublicKey extends Key {
    /**
     * @internal
     * @hideconstructor
     * @param {cryptography.PublicKey} key
     */
    constructor(key) {
        super();

        this._key = key;
    }

    /**
     * @param {Uint8Array} data
     * @returns {PublicKey}
     */
    static fromBytes(data) {
        return new PublicKey(cryptography.PublicKey.fromBytes(data));
    }

    /**
     * @param {Uint8Array} data
     * @returns {PublicKey}
     */
    static fromBytesED25519(data) {
        return new PublicKey(cryptography.PublicKey.fromBytesED25519(data));
    }

    /**
     * @param {Uint8Array} data
     * @returns {PublicKey}
     */
    static fromBytesECDSA(data) {
        return new PublicKey(cryptography.PublicKey.fromBytesECDSA(data));
    }

    /**
     * Parse a public key from a string of hexadecimal digits.
     *
     * The public key may optionally be prefixed with
     * the DER header.
     *
     * @param {string} text
     * @returns {PublicKey}
     */
    static fromString(text) {
        return new PublicKey(cryptography.PublicKey.fromString(text));
    }

    /**
     * Parse an ECDSA public key from a string of hexadecimal digits.
     *
     * @param {string} text
     * @returns {PublicKey}
     */
    static fromStringECDSA(text) {
        return new PublicKey(cryptography.PublicKey.fromStringECDSA(text));
    }

    /**
     * Parse an ED25519 public key from a string of hexadecimal digits.
     *
     * @param {string} text
     * @returns {PublicKey}
     */
    static fromStringED25519(text) {
        return new PublicKey(cryptography.PublicKey.fromStringED25519(text));
    }

    /**
     * Verify a signature on a message with this public key.
     *
     * @param {Uint8Array} message
     * @param {Uint8Array} signature
     * @returns {boolean}
     */
    verify(message, signature) {
        return this._key.verify(message, signature);
    }

    /**
     * @param {Transaction} transaction
     * @returns {boolean}
     */
    verifyTransaction(transaction) {
        transaction._requireFrozen();

        if (!transaction.isFrozen()) {
            transaction.freeze();
        }

        for (const signedTransaction of transaction._signedTransactions.list) {
            if (
                signedTransaction.sigMap != null &&
                signedTransaction.sigMap.sigPair != null
            ) {
                let found = false;
                for (const sigPair of signedTransaction.sigMap.sigPair) {
                    const pubKeyPrefix = /** @type {Uint8Array} */ (
                        sigPair.pubKeyPrefix
                    );
                    if (arrayEqual(pubKeyPrefix, this.toBytesRaw())) {
                        found = true;

                        const bodyBytes = /** @type {Uint8Array} */ (
                            signedTransaction.bodyBytes
                        );

                        let signature = null;
                        if (sigPair.ed25519 != null) {
                            signature = sigPair.ed25519;
                        } else if (sigPair.ECDSASecp256k1 != null) {
                            signature = sigPair.ECDSASecp256k1;
                        }

                        if (signature == null) {
                            continue;
                        }

                        if (!this.verify(bodyBytes, signature)) {
                            return false;
                        }
                    }
                }

                if (!found) {
                    return false;
                }
            }
        }

        return true;
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
     * @deprecated Use `toEvmAddress()` instead.
     * @returns {string}
     */
    toEthereumAddress() {
        return this._key.toEthereumAddress();
    }

    /**
     * @returns {string}
     */
    toEvmAddress() {
        return this._key.toEthereumAddress();
    }

    /**
     * @returns {string}
     */
    toString() {
        return this._key.toString();
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
     * @param {PublicKey} other
     * @returns {boolean}
     */
    equals(other) {
        return this._key.equals(other._key);
    }

    /**
     * @returns {HashgraphProto.proto.IKey}
     */
    _toProtobufKey() {
        switch (this._key._type) {
            case "ED25519":
                return {
                    ed25519: this._key.toBytesRaw(),
                };
            case "secp256k1":
                return {
                    ECDSASecp256k1: this._key.toBytesRaw(),
                };
            default:
                throw new Error(`unrecognized key type ${this._key._type}`);
        }
    }

    /**
     * @param {Uint8Array} signature
     * @returns {HashgraphProto.proto.ISignaturePair}
     */
    _toProtobufSignature(signature) {
        switch (this._key._type) {
            case "ED25519":
                return {
                    pubKeyPrefix: this._key.toBytesRaw(),
                    ed25519: signature,
                };
            case "secp256k1":
                return {
                    pubKeyPrefix: this._key.toBytesRaw(),
                    ECDSASecp256k1: signature,
                };
            default:
                throw new Error(`unrecognized key type ${this._key._type}`);
        }
    }

    /**
     * @param {Long | number} shard
     * @param {Long | number} realm
     * @returns {AccountId}
     */
    toAccountId(shard, realm) {
        return CACHE.accountIdConstructor(shard, realm, this);
    }
}

CACHE.setPublicKeyED25519((key) => PublicKey.fromBytesED25519(key));
CACHE.setPublicKeyECDSA((key) => PublicKey.fromBytesECDSA(key));
