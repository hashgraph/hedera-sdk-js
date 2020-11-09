import ManagedNode from "./ManagedNode.js";

/**
 * @typedef {import("./account/AccountId.js").default} AccountId
 * @typedef {import("./channel/Channel.js").default} Channel
 */

/**
 * @template {Channel} ChannelT
 * @augments {ManagedNode<ChannelT>}
 */
export default class Node extends ManagedNode {
    /**
     * @param {AccountId} accountId
     * @param {string} address
     * @param {(address: string) => ChannelT} channelInitFunction
     */
    constructor(accountId, address, channelInitFunction) {
        super(address, channelInitFunction);

        this.accountId = accountId;

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
