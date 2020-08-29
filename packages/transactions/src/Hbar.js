import HbarRangeError from "./HbarRangeError.js";
import HbarUnit from "./HbarUnit.js";
import Long from "long";
import { root } from "./generated/proto.js";

/**
 * @param {Long} amount
 * @param {HbarUnit} unit
 * @returns {Long}
 */
function convertToTinybar(amount, unit) {
    const bnAmount = Long.isLong(amount) ? amount : new Long(amount);
    return bnAmount.mul(unit._toTinybarCount());
}

const MAX_TINYBAR = Long.MAX_VALUE.div(HbarUnit.Hbar._toTinybarCount());
const MIN_TINYBAR = Long.MIN_VALUE.div(HbarUnit.Hbar._toTinybarCount());

/**
 * Typesafe wrapper for values of HBAR providing foolproof conversions to other denominations.
 */
export default class Hbar {
    /**
     * @param {Long | number} amount
     */
    constructor(amount) {
        amount = amount instanceof Long ? amount : Long.fromNumber(amount);

        if (amount.isZero()) {
            /**
             * The HBAR value in tinybar, used natively by the SDK and Hedera itself
             *
             * @type {Long}
             */
            this._tinybar = amount;
        } else {
            this._tinybar = amount.mul(HbarUnit.Hbar._toTinybarCount());
            this._check({ allowNegative: true });
        }

        // See `Hbar.fromTinybar()` as to why this is done
        if (typeof amount === "number" && amount >= 2 ** 53) {
            throw new HbarRangeError(this);
        }
    }

    /**
     * @type {Hbar}
     */
    static MAX = new Hbar(MAX_TINYBAR);

    /**
     * @type {Hbar}
     */
    static MIN = new Hbar(MIN_TINYBAR);

    /**
     * @type {Hbar}
     */
    static ZERO = new Hbar(Long.fromNumber(0));

    /**
     * Calculate the HBAR amount given a raw value and a unit.
     *
     * @param {Long} amount
     * @param {HbarUnit} unit
     * @returns {Hbar}
     */
    static from(amount, unit) {
        return Hbar.fromTinybar(Long.fromValue(amount).mul(unit._toTinybarCount()));
    }

    /**
     * Get HBAR from a tinybar amount, may be a string
     *
     * @param {Long | number} amount
     * @returns {Hbar}
     */
    static fromTinybar(amount) {
        const tinybar = Long.fromValue(amount);
        const hbar = new Hbar(Long.fromNumber(0));
        hbar._tinybar = tinybar;

        // Check if amount is out of range after hbar is constructed
        // Technically we're able to successfully construct Hbar from 2 ** 53,
        // but at that point the number is out of range for a js `number` type
        // so we throw an error to indicate this. If someone wants to use values
        // 2 ** 53 and higher then they shhould wrap the number in Long.
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
     * @returns {Long}
     */
    value() {
        return this.as(HbarUnit.Hbar);
    }

    /**
     * @returns {Long}
     */
    asTinybar() {
        return this.as(HbarUnit.Tinybar);
    }

    /**
     * @param {HbarUnit} unit
     * @returns {Long}
     */
    as(unit) {
        if (unit.toString() === HbarUnit.Tinybar.toString()) {
            return this._tinybar;
        }

        return this._tinybar.div(unit._toTinybarCount());
    }

    /**
     * @param {Hbar | Long} amount
     * @param {HbarUnit | undefined} unit
     * @returns {boolean}
     */
    equals(amount, unit) {
        return amount instanceof Hbar ?
            this._tinybar.equals(amount._tinybar) :
            this._tinybar.equals(convertToTinybar(amount, unit ?? HbarUnit.Hbar));
    }

    /**
     * @param {Hbar | Long} amount
     * @param {HbarUnit | undefined} unit
     * @returns {number}
     */
    comparedTo(amount, unit) {
        return amount instanceof Hbar ?
            this._tinybar.comp(amount._tinybar) :
            this._tinybar.comp(convertToTinybar(amount, unit ?? HbarUnit.Hbar));
    }

    /**
     * @returns {boolean}
     */
    isZero() {
        return this._tinybar.isZero();
    }

    /**
     * @returns {Hbar}
     */
    negated() {
        return Hbar.fromTinybar(this._tinybar.negate());
    }

    /**
     * @returns {boolean}
     */
    isNegative() {
        return this._tinybar.isNegative();
    }

    /**
     * @returns {boolean}
     */
    isPositive() {
        return this._tinybar.isPositive();
    }

    /**
     * @param {{allowNegative: boolean}} first
     * @returns {void}
     */
    _check({ allowNegative }) {
        const tinybar = this._tinybar;
        if (tinybar.isNegative() && !allowNegative) {
            throw new HbarRangeError(this);
        }
    }

    /**
     * @returns {string}
     */
    toProtobuf() {
        return String(this._tinybar);
    }

    /**
     * @returns {root.UInt64Value}
     */
    toProtobufValue() {
        const value = new root.UInt64Value();
        value.setValue(this._tinybar.toNumber());
        return value;
    }
}

/**
 * @param {Hbar | Long | number} number
 * @returns {Hbar}
 */
export function hbarFromTinybarOrHbar(number) {
    if (number instanceof Hbar) {
        return number;
    }

    return Hbar.fromTinybar(Long.fromValue(number));
}
