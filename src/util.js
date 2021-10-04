export class util {
    /**
     * Utility Error Messages
     */
    static requireNonNullError = "This value cannot be null nor undefined.";
    static requireStringError = "This value must be a string.";
    static requireUint8ArrayError = "This value must be a Uint8Array.";

    /**
     * @param {any | null | undefined} variable
     * @returns {boolean}
     */
    static requireNonNull(variable) {
        if (variable == null || variable == undefined) {
            throw new Error(this.requireNonNullError);
        } else {
            return true;
        }
    }

    /**
     * @param {any | null | undefined} variable
     * @returns {boolean}
     */
    static requireString(variable) {
        this.requireNonNull(variable);
        if (typeof variable !== "string") {
            throw new Error(this.requireStringError);
        } else {
            return true;
        }
    }

    /**
     * @param {any | null | undefined} variable
     * @returns {boolean}
     */
    static requireUint8Array(variable) {
        this.requireNonNull(variable);
        if (!(variable instanceof Uint8Array)) {
            throw new Error(this.requireUint8ArrayError);
        } else {
            return true;
        }
    }
}
