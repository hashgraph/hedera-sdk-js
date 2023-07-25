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

import * as hex from "./encoding/hex.js";

/**
 * Represents the ID of a network.
 */
export default class LedgerId {
    /**
     * @hideconstructor
     * @internal
     * @param {Uint8Array} ledgerId
     */
    constructor(ledgerId) {
        /**
         * @readonly
         * @type {Uint8Array}
         */
        this._ledgerId = ledgerId;

        Object.freeze(this);
    }

    /**
     * @param {string} ledgerId
     * @returns {LedgerId}
     */
    static fromString(ledgerId) {
        switch (ledgerId) {
            case NETNAMES[0]:
            case "0":
                return LedgerId.MAINNET;
            case NETNAMES[1]:
            case "1":
                return LedgerId.TESTNET;
            case NETNAMES[2]:
            case "2":
                return LedgerId.PREVIEWNET;
            case NETNAMES[3]:
            case "3":
                return LedgerId.LOCAL_NODE;
            default: {
                let ledgerIdDecoded = hex.decode(ledgerId);
                if (ledgerIdDecoded.length == 0 && ledgerId.length != 0) {
                    throw new Error("Default reached for fromString");
                } else {
                    return new LedgerId(ledgerIdDecoded);
                }
            }
        }
    }

    /**
     * If the ledger ID is a known value such as `[0]`, `[1]`, `[2]` this method
     * will instead return "mainnet", "testnet", or "previewnet", otherwise it will
     * hex encode the bytes.
     *
     * @returns {string}
     */
    toString() {
        if (this._ledgerId.length == 1) {
            switch (this._ledgerId[0]) {
                case 0:
                    return NETNAMES[0];
                case 1:
                    return NETNAMES[1];
                case 2:
                    return NETNAMES[2];
                case 3:
                    return NETNAMES[3];
                default:
                    return hex.encode(this._ledgerId);
            }
        } else {
            return hex.encode(this._ledgerId);
        }
    }

    /**
     * Using the UTF-8 byte representation of "mainnet", "testnet",
     * or "previewnet" is NOT supported.
     *
     * @param {Uint8Array} bytes
     * @returns {LedgerId}
     */
    static fromBytes(bytes) {
        return new LedgerId(bytes);
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return this._ledgerId;
    }

    /**
     * @returns {boolean}
     */
    isMainnet() {
        return this.toString() == NETNAMES[0];
    }

    /**
     * @returns {boolean}
     */
    isTestnet() {
        return this.toString() == NETNAMES[1];
    }

    /**
     * @returns {boolean}
     */
    isPreviewnet() {
        return this.toString() == NETNAMES[2];
    }

    /**
     * @returns {boolean}
     */
    isLocalNode() {
        return this.toString() == NETNAMES[3];
    }
}

const NETNAMES = ["mainnet", "testnet", "previewnet", "local-node"];

LedgerId.MAINNET = new LedgerId(new Uint8Array([0]));

LedgerId.TESTNET = new LedgerId(new Uint8Array([1]));

LedgerId.PREVIEWNET = new LedgerId(new Uint8Array([2]));

LedgerId.LOCAL_NODE = new LedgerId(new Uint8Array([3]));
