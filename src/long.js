import BigNumber from "bignumber.js";
import Long from "long";

/**
 * @typedef {{low: number, high: number, unsigned: boolean}} LongObject
 */

/**
 * @param {Long | number | string | LongObject | BigNumber} value
 * @returns {Long}
 */
export function valueToLong(value) {
    if (BigNumber.isBigNumber(value)) {
        return Long.fromString(value.toString());
    } else if (value instanceof Long) {
        return value;
    } else {
        return Long.fromValue(value);
    }
}
