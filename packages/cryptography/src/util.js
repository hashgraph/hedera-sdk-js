export const HMAC_ALGORITHM = "sha384";

/**
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {boolean}
 */
export function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (const [i, element] of a.entries()) {
        if (element !== b[i]) return false;
    }
    return true;
}
