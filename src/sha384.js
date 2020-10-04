/**
 * @param {Uint8Array} data
 * @returns {Promise<Uint8Array>}
 */
export async function digest(data) {
    // try subtle crypto if it exists
    if (typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined") {
        // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
        return new Uint8Array(await crypto.subtle.digest("SHA-384", data));
    }

    // fallback to trying node-crypto which could be polyfilled by the browser environment
    return (await import("crypto")).createHash("sha384").update(data).digest();
}
