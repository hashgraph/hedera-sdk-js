/**
 * @typedef {import("./account/AccountId.js").default} AccountId
 */

export default class Node {
    /**
     * @param {AccountId} accountId
     * @param {string} address
     */
    constructor(accountId, address) {
        this.accountId = accountId;
        this.address = address;

        /** @type {number} */
        this.delay = 250;

        /** @type {number | null} */
        this.lastUsed = null;
    }

    /**
     * Determines if this node is healthy by checking if this node hasn't been
     * in use for a the required `delay` period. Since this looks at `this.lastUsed`
     * and that value is only set in the `wait()` method, any node that has not
     * returned a bad gRPC status will always be considered healthy.
     *
     * @returns {boolean}
     */
    isHealthy() {
        if (this.lastUsed != null) {
            return this.lastUsed + this.delay < Date.now();
        }

        return true;
    }

    increaseDelay() {
        this.lastUsed = Date.now();
        this.delay = Math.min(this.delay * 2, 8000);
    }

    decreaseDelay() {
        this.delay = Math.max(this.delay / 2, 250);
    }

    /**
     * This is only ever called if the node itself is down.
     * A node returning a transaction with a bad status code does not indicate
     * the node is down, and hence this method will not be called.
     *
     * @returns {Promise<void>}
     */
    wait() {
        const delay =
            (this.lastUsed != null ? this.lastUsed : 0) +
            this.delay -
            Date.now();
        return new Promise((resolve) => setTimeout(resolve, delay));
    }
}
