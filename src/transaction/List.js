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
 * A custom list type which round robins, supports locking, and as additional
 * QoL improvements.
 *
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
     * Overwrite the entire list.
     *
     * @throws if the list is locked
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
     * Push items to the end of the list.
     *
     * @throws if the list is locked
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
     * Locks the list.
     *
     * @returns {this}
     */
    setLocked() {
        this.locked = true;
        return this;
    }

    /**
     * Clear the list
     *
     * @throws if the list is locked
     */
    clear() {
        if (this.locked) {
            throw new Error("list is locked");
        }

        this.list = [];
        this.index = 0;
    }

    /**
     * The get value at a particular index.
     *
     * @param {number} index
     * @returns {T}
     */
    get(index) {
        return this.list[index];
    }

    /**
     * Set value at index
     *
     * @throws if the list is locked
     * @param {number} index
     * @param {T} item
     * @returns {this}
     */
    set(index, item) {
        if (this.locked) {
            throw new Error("list is locked");
        }

        // QoL: If the index is at the end simply push the element to the end
        if (index === this.length) {
            this.list.push(item);
        } else {
            this.list[index] = item;
        }

        return this;
    }

    /**
     * Set value at index if it's not already set
     *
     * @throws if the list is locked
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
     * Get the current value, and advance the index
     *
     * @returns {T}
     */
    get next() {
        return this.get(this.advance());
    }

    /**
     * Get the current value.
     *
     * @returns {T}
     */
    get current() {
        return this.get(this.index);
    }

    /**
     * Advance the index to the next element in a round robin fashion
     *
     * @returns {number}
     */
    advance() {
        const index = this.index;
        this.index = (this.index + 1) % this.list.length;
        return index;
    }

    /**
     * Is the list empty
     *
     * @returns {boolean}
     */
    get isEmpty() {
        return this.length === 0;
    }

    /**
     * Get the length of the list
     *
     * @returns {number}
     */
    get length() {
        return this.list.length;
    }

    /**
     * Shallow clone this list.
     * Perhaps we should explicitly call this `shallowClone()` since it doesn't
     * clone the list inside?
     *
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
