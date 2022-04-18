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

/**
 * @abstract
 * @template {{ toString(): string }} KeyT
 * @template {any} ValueT
 */
export default class ObjectMap {
    /**
     * @param {(s: string) => KeyT} fromString
     */
    constructor(fromString) {
        /** @type {Map<string, ValueT>} */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this._map = new Map();

        /** @type {Map<KeyT, ValueT>} */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.__map = new Map();

        this._fromString = fromString;
    }

    /**
     * @param {KeyT | string} key
     * @returns {?ValueT}
     */
    get(key) {
        const k = typeof key === "string" ? key : key.toString();

        const value = this._map.get(k);
        return value != null ? value : null;
    }

    /**
     * @internal
     * @param {KeyT} key
     * @param {ValueT} value
     */
    _set(key, value) {
        const k = typeof key === "string" ? key : key.toString();

        this._map.set(k, value);
        this.__map.set(key, value);
    }

    /**
     * @returns {IterableIterator<ValueT>}
     */
    values() {
        return this._map.values();
    }

    /**
     * @returns {number}
     */
    get size() {
        return this._map.size;
    }

    /**
     * @returns {IterableIterator<KeyT>}
     */
    keys() {
        return this.__map.keys();
    }

    /**
     * @returns {IterableIterator<[KeyT, ValueT]>}
     */
    [Symbol.iterator]() {
        return this.__map[Symbol.iterator]();
    }

    /**
     * @returns {string}
     */
    toString() {
        /** @type {Object.<string, any>} */
        const map = {};

        for (const [key, value] of this._map) {
            map[key] = value;
        }

        return JSON.stringify(map);
    }
}
