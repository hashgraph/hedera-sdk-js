import BigNumber from "bignumber.js";
import { HbarRangeError } from "./errors/hbar_range_error";
import { HbarUnit } from "./hbar_unit";
// import { UInt64Value } from "google-protobuf/google/protobuf/wrappers_pb";

/**
 * @param {BigNumber.Value } amount
 * @param {HbarUnit} unit
 * @returns {BigNumber}
 */
function convertToTinybar(amount, unit) {
    const bnAmount = BigNumber.isBigNumber(amount)
        ? amount
        : new BigNumber(amount);
    return bnAmount.multipliedBy(unit._toTinybarCount());
}

const maxTinybar = new BigNumber(2).pow(63).minus(1);
const maxHbar = maxTinybar.dividedBy(HbarUnit.Hbar._toTinybarCount());

const minTinybar = new BigNumber(-2).pow(63);
const minHbar = minTinybar.dividedBy(HbarUnit.Hbar._toTinybarCount());

/**
 * Typesafe wrapper for values of HBAR providing foolproof conversions to other denominations.
 */
export class Hbar {
    /**
     * @param {BigNumber.Value} amount
     */
    constructor(amount) {
        const bnAmount =
            amount instanceof BigNumber ? amount : new BigNumber(amount);

        if (bnAmount.isZero()) {
            this._hbarTinybar = bnAmount;
        } else {
            this._hbarTinybar = bnAmount.multipliedBy(
                HbarUnit.Hbar._toTinybarCount()
            );
            this._hbarCheck({ allowNegative: true });
        }

        // See `Hbar.fromTinybar()` as to why this is done
        if (typeof amount === "number" && amount >= 2 ** 53) {
            throw new HbarRangeError(this);
        }
    }

    /**
     * Calculate the HBAR amount given a raw value and a unit.
     *
     * @param {BigNumber.Value} amount
     * @param {HbarUnit} unit
     * @returns {Hbar}
     */
    static from(amount, unit) {
        const bnAmount = new BigNumber(amount);
        const hbar = new Hbar(0);
        hbar._hbarTinybar = bnAmount.multipliedBy(unit._toTinybarCount());
        return hbar;
    }

    /**
     * Get HBAR from a tinybar amount, may be a string
     *
     * @param {BigNumber.Value} amount
     * @returns {Hbar}
     */
    static fromTinybar(amount) {
        const bnAmount = new BigNumber(amount);
        const hbar = new Hbar(0);
        hbar._hbarTinybar = bnAmount;

        // Check if amount is out of range after hbar is constructed
        // Technically we're able to successfully construct Hbar from 2 ** 53,
        // but at that point the number is out of range for a js `number` type
        // so we throw an error to indicate this. If someone wants to use values
        // 2 ** 53 and higher then they shhould wrap the number in BigNumber.
        if (typeof amount === "number" && amount >= 2 ** 53) {
            throw new HbarRangeError(hbar);
        }

        return hbar;
    }

    /**
     * @returns {string}
     */
    toString() {
        return this.value().toString();
    }

    /**
     * @returns {BigNumber}
     */
    value() {
        return this.as(HbarUnit.Hbar);
    }

    /**
     * @returns {BigNumber}
     */
    asTinybar() {
        return this.as(HbarUnit.Tinybar);
    }

    /**
     * @param {HbarUnit} unit
     * @returns {BigNumber}
     */
    as(unit) {
        if (unit.toString() === HbarUnit.Tinybar.toString()) {
            return this._hbarTinybar;
        }

        return this._hbarTinybar.dividedBy(unit._toTinybarCount());
    }

    /**
     * @param {BigNumber.Value} amount
     * @returns {Hbar}
     */
    multipliedBy(amount) {
        return new Hbar(
            this._hbarTinybar
                .multipliedBy(amount)
                .dividedBy(HbarUnit.Hbar._toTinybarCount())
        );
    }

    /**
     * @param {Hbar | BigNumber.Value} amount
     * @param {HbarUnit} unit
     * @returns {Hbar}
     */
    plus(amount, unit) {
        return new Hbar(
            (amount instanceof Hbar
                ? this._hbarTinybar.plus(amount._hbarTinybar)
                : this._hbarTinybar.plus(convertToTinybar(amount, unit))
            ).dividedBy(HbarUnit.Hbar._toTinybarCount())
        );
    }

    /**
     * @param {Hbar | BigNumber.Value} amount
     * @param {HbarUnit} unit
     * @returns {Hbar}
     */
    minus(amount, unit) {
        return new Hbar(
            (amount instanceof Hbar
                ? this._hbarTinybar.minus(amount._hbarTinybar)
                : this._hbarTinybar.minus(convertToTinybar(amount, unit))
            ).dividedBy(HbarUnit.Hbar._toTinybarCount())
        );
    }

    /**
     * @param {Hbar | BigNumber.Value} amount
     * @param {HbarUnit} unit
     * @returns {boolean}
     */
    isEqualTo(amount, unit) {
        return amount instanceof Hbar
            ? this._hbarTinybar.isEqualTo(amount._hbarTinybar)
            : this._hbarTinybar.isEqualTo(convertToTinybar(amount, unit));
    }

    /**
     * @param {Hbar | BigNumber.Value} amount
     * @param {HbarUnit} unit
     * @returns {boolean}
     */
    isGreaterThan(amount, unit) {
        return amount instanceof Hbar
            ? this._hbarTinybar.isGreaterThan(amount._hbarTinybar)
            : this._hbarTinybar.isGreaterThan(convertToTinybar(amount, unit));
    }

    /**
     * @param {Hbar | BigNumber.Value} amount
     * @param {HbarUnit} unit
     * @returns {boolean}
     */
    isGreaterThanOrEqualTo(amount, unit) {
        return amount instanceof Hbar
            ? this._hbarTinybar.isGreaterThanOrEqualTo(amount._hbarTinybar)
            : this._hbarTinybar.isGreaterThanOrEqualTo(
                  convertToTinybar(amount, unit)
              );
    }

    /**
     * @param {Hbar | BigNumber.Value} amount
     * @param {HbarUnit} unit
     * @returns {boolean}
     */
    isLessThan(amount, unit) {
        return amount instanceof Hbar
            ? this._hbarTinybar.isLessThan(amount._hbarTinybar)
            : this._hbarTinybar.isLessThan(convertToTinybar(amount, unit));
    }

    /**
     * @param {Hbar | BigNumber.Value} amount
     * @param {HbarUnit} unit
     * @returns {boolean}
     */
    isLessThanOrEqualTo(amount, unit) {
        return amount instanceof Hbar
            ? this._hbarTinybar.isLessThanOrEqualTo(amount._hbarTinybar)
            : this._hbarTinybar.isLessThanOrEqualTo(
                  convertToTinybar(amount, unit)
              );
    }

    /**
     * @param {Hbar | BigNumber.Value} amount
     * @param {HbarUnit} unit
     * @returns {number}
     */
    comparedTo(amount, unit) {
        return amount instanceof Hbar
            ? this._hbarTinybar.comparedTo(amount._hbarTinybar)
            : this._hbarTinybar.comparedTo(convertToTinybar(amount, unit));
    }

    /**
     * @returns {boolean}
     */
    isZero() {
        return this._hbarTinybar.isZero();
    }

    /**
     * @returns {Hbar}
     */
    negated() {
        return Hbar.fromTinybar(this._hbarTinybar.negated());
    }

    /**
     * @returns {boolean}
     */
    isNegative() {
        return this._hbarTinybar.isNegative();
    }

    /**
     * @returns {boolean}
     */
    isPositive() {
        return this._hbarTinybar.isPositive();
    }

    /**
     * @param {{ allowNegative: boolean }} o
     * @returns {void}
     */
    _hbarCheck(o) {
        const tinybar = this._hbarTinybar;
        if (
            tinybar.isNegative() &&
            !o.allowNegative &&
            tinybar.isLessThan(maxTinybar)
        ) {
            throw new HbarRangeError(this);
        }

        if (tinybar.isGreaterThan(maxTinybar)) {
            throw new HbarRangeError(this);
        }
    }

    /**
     * @returns {string}
     */
    _hbarToProto() {
        return String(this._hbarTinybar);
    }

    // /**
    //  * @returns {UInt64Value}
    //  */
    // _hbarToProtoValue() {
    //     const value = new UInt64Value();
    //     value.setValue(this._hbarTinybar.toNumber());
    //     return value;
    // }
}

Hbar.MAX = new Hbar(maxHbar);
Hbar.MIN = new Hbar(minHbar);
Hbar.ZERO = new Hbar(0);

/**
 * @param {Hbar | BigNumber.Value} number
 * @returns {Hbar}
 */
export function hbarFromTinybarOrHbar(number) {
    if (number instanceof Hbar) {
        return number;
    }

    return Hbar.fromTinybar(new BigNumber(number));
}
