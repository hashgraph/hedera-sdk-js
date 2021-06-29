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
        return new Hbar(new BigNumber(str), unit);
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
     * @override
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
