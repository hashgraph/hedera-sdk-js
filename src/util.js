/**
 * Utility Error Messages
 */
export const REQUIRE_NON_NULL_ERROR = "This value cannot be null | undefined.";
export const REQUIRE_STRING_ERROR = "This value must be a string.";
export const REQUIRE_UINT8ARRAY_ERROR = "This value must be a Uint8Array.";

/**
 * @param {any | null | undefined} variable
 * @returns {boolean}
 */
export function REQUIRE_NON_NULL(variable) {
    if (variable == null || variable == undefined) {
        throw new Error(REQUIRE_NON_NULL_ERROR);
    } else {
        return true;
    }
}

/**
 * @param {any | null | undefined} variable
 * @returns {boolean}
 */
export function REQUIRE_STRING(variable) {
    REQUIRE_NON_NULL(variable);
    if (typeof variable !== "string") {
        throw new Error(REQUIRE_STRING_ERROR);
    } else {
        return true;
    }
}

/**
 * @param {any | null | undefined} variable
 * @returns {boolean}
 */
export function REQUIRE_UINT8ARRAY(variable) {
    REQUIRE_NON_NULL(variable);
    if (!(variable instanceof Uint8Array)) {
        throw new Error(REQUIRE_UINT8ARRAY_ERROR);
    } else {
        return true;
    }
}
