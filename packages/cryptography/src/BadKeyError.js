export default class BadKeyError extends Error {
    /**
     * @param {string | undefined} msg
     */
    constructor(msg) {
        super();
        this.message = msg ? msg : "Failed to parse correct key";
        this.name = "BadKeyError";
    }
}
