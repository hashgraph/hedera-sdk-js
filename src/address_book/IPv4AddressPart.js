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

export default class IPv4AddressPart {
    /**
     * @param {object} props
     * @param {number} [props.left]
     * @param {number} [props.right]
     */
    constructor(props = {}) {
        /**
         * @type {number | null}
         */
        this._left = null;

        if (props.left != null) {
            this.setLeft(props.left);
        }

        /**
         * @type {number | null}
         */
        this._right = null;

        if (props.right != null) {
            this.setRight(props.right);
        }
    }

    /**
     * @returns {?number}
     */
    get left() {
        return this._left;
    }

    /**
     * @param {number} part
     * @returns {this}
     */
    setLeft(part) {
        this._left = part;
        return this;
    }

    /**
     * @returns {?number}
     */
    get right() {
        return this._right;
    }

    /**
     * @param {number} part
     * @returns {this}
     */
    setRight(part) {
        this._right = part;
        return this;
    }

    /**
     * @returns {string}
     */
    toString() {
        if (this._left != null && this._right != null) {
            return `${this._left.toString()}.${this._right.toString()}`;
        } else {
            return "";
        }
    }
}
