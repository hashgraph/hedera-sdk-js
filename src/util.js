/**
 * Utility Error Messages
 */
export const REQUIRE_NON_NULL_ERROR = "This value cannot be null | undefined.";
export const REQUIRE_STRING_ERROR = "This value must be a string.";
export const REQUIRE_UINT8ARRAY_ERROR = "This value must be a Uint8Array.";
export const REQUIRE_STRING_OR_UINT8ARRAY_ERROR =
    "This value must be a string or Uint8Array.";

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
 * Takes any param and returns true if param is not null and of type Uint8Array.
 *
 * @param {any | null | undefined} variable
 * @returns {boolean}
 */
export function isUint8Array(variable) {
    return isNonNull(variable) && variable instanceof Uint8Array;
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

/**
 * Takes any param and throws custom error if non string.
 *
 * @param {any | null | undefined} variable
 * @returns {boolean}
 */
export function requireString(variable) {
    if (!isString(requireNonNull(variable))) {
        throw new Error(REQUIRE_STRING_ERROR);
    } else {
        return variable;
    }
}

/**
 * Takes any param and throws custom error if non Uint8Array.
 *
 * @param {any | null | undefined} variable
 * @returns {boolean}
 */
export function requireUint8Array(variable) {
    if (!isUint8Array(requireNonNull(variable))) {
        throw new Error(REQUIRE_UINT8ARRAY_ERROR);
    } else {
        return variable;
    }
}

/**
 * Takes any param and throws custom error if null or undefined.
 *
 * @param {any | null | undefined} variable
 * @returns {any}
 */
export function requireNonNull(variable) {
    if (!isNonNull(variable)) {
        throw new Error(REQUIRE_NON_NULL_ERROR);
    } else {
        return variable;
    }
}

/**
 * Takes any param and throws custom error if null or undefined and not a string or Uint8Array.
 *
 * @param {any | null | undefined} variable
 * @returns {string | Uint8Array}
 */
export function requireStringOrUint8Array(variable) {
    if (isString(variable) || isUint8Array(variable)) {
        return variable;
    } else {
        throw new Error(REQUIRE_STRING_OR_UINT8ARRAY_ERROR);
    }
}
