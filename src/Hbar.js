import BigNumber from "bignumber.js";
import Long from "long";
import HbarUnit from "./HbarUnit";

export default class Hbar {
    /**
     * @param {number | Long | BigNumber} amount
     * @param {HbarUnit=} unit
     */
    constructor(amount, unit = HbarUnit.Hbar) {
        let bigAmount = amount;

        if (bigAmount instanceof Long) {
            bigAmount = new BigNumber(bigAmount.toString(10));
        } else if (!BigNumber.isBigNumber(bigAmount)) {
            bigAmount = new BigNumber(bigAmount);
        }

        this._valueInTinybar = bigAmount.multipliedBy(unit._tinybar);
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
        return this._valueInTinybar.dividedBy(unit._tinybar);
    }

    /**
     * @returns {BigNumber}
     */
    toTinybars() {
        return this._valueInTinybar;
    }

    /**
     * @returns {Long}
     */
    _toProtobuf() {
        return Long.fromString(this._valueInTinybar.toString(10));
    }

    /**
     * @override
     * @returns {string}
     */
    toString() {
        if (
            this._valueInTinybar.isLessThan(10_000) &&
            this._valueInTinybar.isGreaterThan(-10_000)
        ) {
            return `${this._valueInTinybar.toString(10)} ${
                HbarUnit.Tinybar._symbol
            }`;
        }

        return `${this.to(HbarUnit.Hbar).toString()} ${HbarUnit.Hbar._symbol}`;
    }
}
