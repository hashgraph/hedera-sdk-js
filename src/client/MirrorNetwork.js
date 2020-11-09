import MirrorNode from "../MirrorNode.js";

/**
 * @typedef {import("../channel/MirrorChannel.js").default} MirrorChannel
 */

/**
 * @typedef {import("./Client.js").NetworkName} NetworkName
 */

/**
 * @template {MirrorChannel} MirrorChannelT
 */
export default class MirrorNetwork {
    /**
     * @param {(address: string) => MirrorChannelT} createMirrorNetworkChannel
     */
    constructor(createMirrorNetworkChannel) {
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
         * @type {Map<string, MirrorNode<MirrorChannelT>>}
         */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.networkNodes = new Map();

        /**
         * List of node account IDs.
         *
         * @private
         * @type {MirrorNode<MirrorChannelT>[]}
         */
        this.nodes = [];

        this.index = 0;

        /** @type {(address: string) => MirrorChannelT} */
        this.createMirrorNetworkChannel = createMirrorNetworkChannel;
    }

    /**
     * @param {string[]} network
     */
    setMirrorNetwork(network) {
        // Remove address that no longer exist
        for (let i = 0; i < this.network.length; i++) {
            const index = network.findIndex(
                // eslint-disable-next-line ie11/no-loop-func
                (address) => address === this.network[i]
            );
            if (index < 0) {
                const node = this.networkNodes.get(this.network[i]);
                if (node != null) {
                    node.close();
                }

                this.networkNodes.delete(this.network[i]);

                const nodesIndex = this.nodes.findIndex(
                    // eslint-disable-next-line ie11/no-loop-func
                    (node) => node.address === this.network[i]
                );
                if (nodesIndex >= 0) {
                    this.nodes.splice(i, 1);
                }
            }
        }

        // Add new address to the list
        for (let i = 0; i < network.length; i++) {
            const index = this.network.findIndex(
                // eslint-disable-next-line ie11/no-loop-func
                (address) => address === network[i]
            );
            if (index < 0) {
                this.networkNodes.set(
                    network[i],
                    new MirrorNode(network[i], this.createMirrorNetworkChannel)
                );
                this.network.push(network[i]);
            }
        }

        this.index = 0;
    }

    /**
     * @returns {MirrorNode<MirrorChannelT>}
     */
    getNextMirrorNode() {
        const node = this.nodes[this.index];
        this.index = (this.index + 1) % this.nodes.length;
        return node;
    }

    close() {
        for (const node of this.nodes) {
            node.close();
        }

        this.nodes = [];
        this.networkNodes.clear();
        this.network = [];
    }
}
