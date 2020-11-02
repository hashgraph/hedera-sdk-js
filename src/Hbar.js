import BigNumber from "bignumber.js";
import Long from "long";
import { valueToLong } from "./long.js";
import HbarUnit from "./HbarUnit.js";

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

            if (amount instanceof Long) {
                bigAmount = new BigNumber(amount.toString(10));
            } else if (Long.isLong(amount)) {
                bigAmount = new BigNumber(Long.fromValue(amount).toString(10));
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
             * @type {Long}
             */
            this._valueInTinybar = Long.fromString(
                bigAmount.multipliedBy(unit._tinybar).toFixed()
            );
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
     * @param {number | Long} amount
     * @returns {Hbar}
     */
    static fromTinybars(amount) {
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
        return new BigNumber(this._valueInTinybar.toString()).dividedBy(
            unit._tinybar
        );
    }

    /**
     * @returns {Long}
     */
    toTinybars() {
        return this._valueInTinybar;
    }

    /**
     * @returns {Hbar}
     */
    negated() {
        return Hbar.fromTinybars(this._valueInTinybar.negate());
    }

    /**
     * @override
     * @returns {string}
     */
    toString() {
        if (
            this._valueInTinybar.lessThan(10000) &&
            this._valueInTinybar.greaterThan(-10000)
        ) {
            return `${this._valueInTinybar.toString()} ${
                HbarUnit.Tinybar._symbol
            }`;
        }

        return `${this.to(HbarUnit.Hbar).toString()} ${HbarUnit.Hbar._symbol}`;
    }
}
