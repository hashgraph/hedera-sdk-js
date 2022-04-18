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

import BigNumber from "bignumber.js";
import { valueToLong } from "./long.js";
import HbarUnit from "./HbarUnit.js";

import Long from "long";

/**
 * @typedef {import("./long.js").LongObject} LongObject
 */

export default class Hbar {
    /**
     * @param {number | string | Long | LongObject | BigNumber} amount
     * @param {HbarUnit=} unit
     */
    constructor(amount, unit = HbarUnit.Hbar) {
        if (unit === HbarUnit.Tinybar) {
            this._valueInTinybar = valueToLong(amount);
        } else {
            /** @type {BigNumber} */
            let bigAmount;

            if (Long.isLong(amount)) {
                bigAmount = new BigNumber(amount.toString(10));
            } else if (
                BigNumber.isBigNumber(amount) ||
                typeof amount === "string" ||
                typeof amount === "number"
            ) {
                bigAmount = new BigNumber(amount);
            } else {
                bigAmount = new BigNumber(0);
            }

            /**
             * @type {BigNumber}
             */
            this._valueInTinybar = bigAmount.multipliedBy(unit._tinybar);
        }
        if (!this._valueInTinybar.isInteger()) {
            throw new Error("Hbar in tinybars contains decimals");
        }
    }

    /**
     * @param {number | Long | BigNumber} amount
     * @param {HbarUnit} unit
     * @returns {Hbar}
     */
    static from(amount, unit) {
        return new Hbar(amount, unit);
    }

    /**
     * @param {number | Long | string | BigNumber} amount
     * @returns {Hbar}
     */
    static fromTinybars(amount) {
        if (typeof amount === "string") {
            return this.fromString(amount, HbarUnit.Tinybar);
        }
        return new Hbar(amount, HbarUnit.Tinybar);
    }

    /**
     * @param {string} str
     * @param {HbarUnit=} unit
     * @returns {Hbar}
     */
    static fromString(str, unit = HbarUnit.Hbar) {
        const pattern = /^((?:\+|-)?\d+(?:\.\d+)?)(?: (tℏ|μℏ|mℏ|ℏ|kℏ|Mℏ|Gℏ))?$/;
        if (pattern.test(str)) {
            let [amount, symbol] = str.split(" ");
            if (symbol != null) {
                unit = HbarUnit.fromString(symbol);
            }
            return new Hbar(new BigNumber(amount), unit);
        } else {
            throw new Error("invalid argument provided");
        }
    }

    /**
     * @param {HbarUnit} unit
     * @returns {BigNumber}
     */
    to(unit) {
        return this._valueInTinybar.dividedBy(unit._tinybar);
    }

    /**
     * @returns {BigNumber}
     */
    toBigNumber() {
        return this.to(HbarUnit.Hbar);
    }

    /**
     * @returns {Long}
     */
    toTinybars() {
        return Long.fromValue(this._valueInTinybar.toFixed());
    }

    /**
     * @returns {Hbar}
     */
    negated() {
        return Hbar.fromTinybars(this._valueInTinybar.negated());
    }

    /**
     * @returns {boolean}
     */
    isNegative() {
        return this._valueInTinybar.isNegative();
    }

    /**
     * @param {HbarUnit=} unit
     * @returns {string}
     */
    toString(unit) {
        if (unit != null) {
            return `${this._valueInTinybar
                .dividedBy(unit._tinybar)
                .toString()} ${unit._symbol}`;
        }

        if (
            this._valueInTinybar.isLessThan(10000) &&
            this._valueInTinybar.isGreaterThan(-10000)
        ) {
            return `${this._valueInTinybar.toFixed()} ${
                HbarUnit.Tinybar._symbol
            }`;
        }

        return `${this.to(HbarUnit.Hbar).toString()} ${HbarUnit.Hbar._symbol}`;
    }
}
