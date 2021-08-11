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
     * @param {number} waitTime
     * @param {(address: string) => ChannelT} channelInitFunction
     */
    constructor(accountId, address, waitTime, channelInitFunction) {
        super(address, channelInitFunction);

        this.accountId = accountId;

        /** @type {number} */
        this.delay = waitTime;

        /** @type {number} */
        this.lastUsed = Date.now();

        /** @type {number} */
        this.delayUntil = Date.now();

        /** @type {number} */
        this.useCount = 0;

        /** @type {number} */
        this.attempts = 0;

        /** @type {number} */
        this.waitTime = waitTime;
    }

    /**
     * @param {number} waitTime
     * @returns {this}
     */
    setWaitTime(waitTime) {
        if (this.delay <= waitTime) {
            this.delay = waitTime;
        }

        this.waitTime = waitTime;
        return this;
    }

    inUse() {
        this.useCount++;
        this.lastUsed = Date.now();
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
        return this.delayUntil <= Date.now();
    }

    increaseDelay() {
        this.delay = Math.min(this.delay * 2, 8000);
        this.delayUntil = Date.now() + this.delay;
    }

    decreaseDelay() {
        this.delay = Math.max(this.delay / 2, this.waitTime);
    }

    /**
     * This is only ever called if the node itself is down.
     * A node returning a transaction with a bad status code does not indicate
     * the node is down, and hence this method will not be called.
     *
     * @returns {Promise<void>}
     */
    wait() {
        const delay = this.delayUntil - this.lastUsed;
        return new Promise((resolve) => setTimeout(resolve, delay));
    }

    /**
     * @param {Node<*>} node
     * @returns {number}
     */
    compare(node) {
        if (this.isHealthy() && node.isHealthy()) {
            if (this.useCount < node.useCount) {
                return -1;
            } else if (this.useCount > node.useCount) {
                return 1;
            } else {
                if (this.lastUsed < node.lastUsed) {
                    return -1;
                } else if (this.lastUsed > node.lastUsed) {
                    return 1;
                } else {
                    return 0;
                }
            }
        } else if (this.isHealthy() && !node.isHealthy()) {
            return -1;
        } else if (!this.isHealthy() && node.isHealthy()) {
            return 1;
        } else {
            if (this.useCount < node.useCount) {
                return -1;
            } else if (this.useCount > node.useCount) {
                return 1;
            } else {
                if (this.lastUsed < node.lastUsed) {
                    return -1;
                } else if (this.lastUsed > node.lastUsed) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }
    }
}
