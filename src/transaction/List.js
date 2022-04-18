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
 * @template {any} T
 */
export default class List {
    constructor() {
        /** @type {T[]} */
        this.list = [];
        this.locked = false;
        this.index = 0;
    }

    /**
     * @param {T[]} list
     * @returns {this}
     */
    setList(list) {
        if (this.locked) {
            throw new Error("list is locked");
        }

        this.list = list;
        this.index = 0;

        return this;
    }

    /**
     * @param {T[]} items
     * @returns {this}
     */
    push(...items) {
        if (this.locked) {
            throw new Error("list is locked");
        }

        this.list.push(...items);
        return this;
    }

    /**
     * @returns {this}
     */
    setLocked() {
        this.locked = true;
        return this;
    }

    clear() {
        if (this.locked) {
            throw new Error("list is locked");
        }

        this.list = [];
        this.index = 0;
    }

    /**
     * @param {number} index
     * @returns {T}
     */
    get(index) {
        return this.list[index];
    }

    /**
     * @param {number} index
     * @param {T} item
     * @returns {this}
     */
    set(index, item) {
        if (this.locked) {
            throw new Error("list is locked");
        }

        if (index === this.length) {
            this.list.push(item);
        } else {
            this.list[index] = item;
        }

        return this;
    }

    /**
     * @param {number} index
     * @param {() => T} lambda
     * @returns {this}
     */
    setIfAbsent(index, lambda) {
        if (index == this.length || this.list[index] == null) {
            this.set(index, lambda());
        }

        return this;
    }

    /**
     * @returns {T}
     */
    get next() {
        return this.get(this.advance());
    }

    /**
     * @returns {T}
     */
    get current() {
        return this.get(this.index);
    }

    /**
     * @returns {number}
     */
    advance() {
        const index = this.index;
        this.index = (this.index + 1) % this.list.length;
        return index;
    }

    /**
     * @returns {boolean}
     */
    get isEmpty() {
        return this.length === 0;
    }

    /**
     * @returns {number}
     */
    get length() {
        return this.list.length;
    }

    /**
     * @returns {List<T>}
     */
    clone() {
        /** @type {List<T>} */
        const list = new List();
        list.list = this.list;
        list.locked = this.locked;
        return list;
    }
}
