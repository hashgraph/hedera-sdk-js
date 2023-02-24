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

import Key from "./Key.js";
import * as hex from "./encoding/hex.js";
import { arrayEqual } from "./util.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IKey} HashgraphProto.proto.IKey
 */

/**
 * @typedef {import("./client/Client.js").default<*, *>} Client
 */

export default class EvmAddress extends Key {
    /**
     * @internal
     * @param {Uint8Array} bytes
     */
    constructor(bytes) {
        super();
        this._bytes = bytes;
    }

    /**
     * @param {string} text
     * @returns {EvmAddress}
     */
    static fromString(text) {
        return new EvmAddress(hex.decode(text));
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {EvmAddress}
     */
    static fromBytes(bytes) {
        return new EvmAddress(bytes);
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return this._bytes;
    }

    /**
     * @returns {string}
     */
    toString() {
        return hex.encode(this._bytes);
    }

    /**
     * @param {EvmAddress} other
     * @returns {boolean}
     */
    equals(other) {
        return arrayEqual(this._bytes, other._bytes);
    }
}
