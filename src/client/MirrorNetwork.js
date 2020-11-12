import MirrorNode from "../MirrorNode.js";

/**
 * @typedef {import("../channel/MirrorChannel.js").default} MirrorChannel
 */

/**
 * @typedef {import("./Client.js").NetworkName} NetworkName
 */
export default class MirrorNetwork {
    /**
     * @param {((address: string) => MirrorChannel)?} channelInitFunction
     */
    constructor(channelInitFunction) {
        /**
         * Map of node account ID (as a string)
         * to the node URL.
         *
         * @internal
         * @type {string[]}
         */
        this.network = [];

        /**
         * Map of node account ID (as a string)
         * to the node URL.
         *
         * @internal
         * @type {Map<string, MirrorNode>}
         */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.networkNodes = new Map();

        this.index = 0;

        /** @type {((address: string) => MirrorChannel)?} */
        this._channelInitFunction = channelInitFunction;
    }

    /**
     * @param {string[]} network
     */
    setMirrorNetwork(network) {
        if (this._channelInitFunction == null) {
            // silently fail on client boot if mirror network is not
            // supported
            return;
        }

        this.close();
        this.network = network;

        for (const address of this.network) {
            this.networkNodes.set(
                address,
                new MirrorNode(address, this._channelInitFunction)
            );
        }

        this.index = 0;
    }

    /**
     * @returns {MirrorNode}
     */
    getNextMirrorNode() {
        if (this._channelInitFunction == null) {
            throw new Error("mirror network not supported on browser");
        }

        const node = this.network[this.index];
        this.index = (this.index + 1) % this.network.length;
        return /** @type {MirrorNode} */ (this.networkNodes.get(node));
    }

    close() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, node] of this.networkNodes) {
            node.close();
        }

        this.networkNodes.clear();
        this.network = [];
    }
}
