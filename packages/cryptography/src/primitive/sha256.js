import crypto from "crypto";

/**
 * @param {Uint8Array} data
 * @returns {Promise<Uint8Array>}
 */
export async function digest(data) {
    // fallback to trying node-crypto which could be polyfilled by the browser environment
    return crypto.createHash("sha256").update(data).digest();
}
