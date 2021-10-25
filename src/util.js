import BigNumber from "bignumber.js";

/**
 * Utility Error Messages
 */
export const REQUIRE_NON_NULL_ERROR = "This value cannot be null | undefined.";
export const REQUIRE_STRING_ERROR = "This value must be a string.";
export const REQUIRE_UINT8ARRAY_ERROR = "This value must be a Uint8Array.";
export const REQUIRE_STRING_OR_UINT8ARRAY_ERROR =
    "This value must be a string or Uint8Array.";
export const REQUIRE_NUMBER_ERROR = "This value must be a Number.";
export const REQUIRE_BIGNUMBER_ERROR = "This value must be a BigNumber.";
export const REQUIRE_ARRAY_ERROR = "The provided variable must be an Array.";

export const REQUIRE_TYPE_ERROR =
    "The provided variables are not matching types.";

export const FUNCTION_CONVERT_TO_BIGNUMBER_ERROR =
    "This value must be a String, Number, or BigNumber to be converted.";

//Soft Checks

/**
 * Takes any param and returns false if null or undefined.
 *
 * @param {any | null | undefined} variable
 * @returns {boolean}
 */
export function isNonNull(variable) {
    if (variable == null || variable == undefined) {
        return false;
    } else {
        return true;
    }
}

/**
 * Takes any param and returns true if param variable and type are the same.
 *
 * @param {any | null | undefined} variable
 * @param {any | null | undefined} type
 * @returns {boolean}
 */
export function isType(variable, type) {
    return typeof variable == type;
}

/**
 * Takes any param and returns true if param is not null and of type Uint8Array.
 *
 * @param {any | null | undefined} variable
 * @returns {boolean}
 */
export function isUint8Array(variable) {
    return isNonNull(variable) && variable instanceof Uint8Array;
}

/**
 * Takes any param and returns true if param is not null and of type Number.
 *
 * @param {any | null | undefined} variable
 * @returns {boolean}
 */
export function isNumber(variable) {
    return (
        isNonNull(variable) &&
        (typeof variable == "number" || variable instanceof Number)
    );
}

/**
 * Takes any param and returns true if param is not null and of type BigNumber.
 *
 * @param {any | null | undefined} variable
 * @returns {boolean}
 */
export function isBigNumber(variable) {
    return isNonNull(variable) && variable instanceof BigNumber;
}

/**
 * Takes any param and returns true if param is not null and of type string.
 *
 * @param {any | null | undefined} variable
 * @returns {boolean}
 */
export function isString(variable) {
    return isNonNull(variable) && typeof variable == "string";
}

/**
 * Takes any param and returns true if param is not null and type string or Uint8Array.
 *
 * @param {any | null | undefined} variable
 * @returns {boolean}
 */
export function isStringOrUint8Array(variable) {
    return isString(variable) || isUint8Array(variable);
}

//Requires

/**
 * Takes any param and throws custom error if null or undefined.
 *
 * @param {object} variable
 * @returns {object}
 */
export function requireNonNull(variable) {
    if (!isNonNull(variable)) {
        throw new Error(REQUIRE_NON_NULL_ERROR);
    } else {
        return variable;
    }
}

/**
 * Takes any param and throws custom error if params are not same type.
 *
 * @param {any | null | undefined} variable
 * @param {any | null | undefined} type
 * @returns {object}
 */
export function requireType(variable, type) {
    if (!isType(variable, type)) {
        throw new Error(REQUIRE_TYPE_ERROR);
    } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return variable;
    }
}

/**
 * Takes any param and throws custom error if non BigNumber.
 *
 * @param {any | null | undefined} variable
 * @returns {BigNumber}
 */
export function requireBigNumber(variable) {
    if (!isBigNumber(requireNonNull(variable))) {
        throw new Error(REQUIRE_BIGNUMBER_ERROR);
    } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return /** @type {BigNumber} */ (variable);
    }
}

/**
 * Takes any param and throws custom error if non string.
 *
 * @param {any | null | undefined} variable
 * @returns {string}
 */
export function requireString(variable) {
    if (!isString(requireNonNull(variable))) {
        throw new Error(REQUIRE_STRING_ERROR);
    } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return /** @type {string} */ (variable);
    }
}

/**
 * Takes any param and throws custom error if non Uint8Array.
 *
 * @param {any | null | undefined} variable
 * @returns {Uint8Array}
 */
export function requireUint8Array(variable) {
    if (!isUint8Array(requireNonNull(variable))) {
        throw new Error(REQUIRE_UINT8ARRAY_ERROR);
    } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return /** @type {Uint8Array} */ (variable);
    }
}

/**
 * Takes any param and throws custom error if non Uint8Array.
 *
 * @param {any | null | undefined} variable
 * @returns {number}
 */
export function requireNumber(variable) {
    if (!isNumber(requireNonNull(variable))) {
        throw new Error(REQUIRE_NUMBER_ERROR);
    } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return /** @type {number} */ (variable);
    }
}

/**
 * Takes any param and throws custom error if null or undefined and not a string or Uint8Array.
 *
 * @param {any | null | undefined} variable
 * @returns {string | Uint8Array}
 */
export function requireStringOrUint8Array(variable) {
    if (isStringOrUint8Array(variable)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return /** @type {string | Uint8Array} */ (variable);
    } else {
        throw new Error(REQUIRE_STRING_OR_UINT8ARRAY_ERROR);
    }
}

//Conversions

/**
 * Converts number or string to BigNumber.
 *
 * @param {any | null | undefined} variable
 * @returns {BigNumber}
 */
export function convertToBigNumber(variable) {
    if (isNumber(variable) || isString(variable) || isBigNumber(variable)) {
        return new BigNumber(variable);
    }
    throw new Error(FUNCTION_CONVERT_TO_BIGNUMBER_ERROR);
}

/**
 * Converts Array of Numbers or Strings to Array of BigNumbers.
 *
 * @param {any | null | undefined} variable
 * @returns {Array<BigNumber>}
 */
export function convertToBigNumberArray(variable) {
    if (variable instanceof Array) {
        return /** @type {Array<BigNumber>} */ (
            variable.map(convertToBigNumber)
        );
    } else {
        throw new Error();
    }
}
