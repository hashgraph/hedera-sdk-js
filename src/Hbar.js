import BigNumber from "bignumber.js";
import Long from "long";
import HbarUnit from "./HbarUnit";

export default class Hbar {
    /**
     * @param {number | string | Long | BigNumber} amount
     * @param {HbarUnit=} unit
     */
    constructor(amount, unit = HbarUnit.Hbar) {
        let bigAmount = amount;

        if (bigAmount instanceof Long) {
            bigAmount = new BigNumber(bigAmount.toString(10));
        } else if (!BigNumber.isBigNumber(bigAmount)) {
            bigAmount = new BigNumber(bigAmount);
        }

        /**
         * @type {Long}
         */
        this._valueInTinybar = Long.fromString(
            bigAmount.multipliedBy(unit._tinybar).toFixed(0)
        );
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
