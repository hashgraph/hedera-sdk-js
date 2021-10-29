import MirrorNode from "../MirrorNode.js";
import ManagedNetwork from "./ManagedNetwork.js";

/**
 * @typedef {import("../channel/MirrorChannel.js").default} MirrorChannel
 */

/**
 * @typedef {import("./Client.js").NetworkName} NetworkName
 * @augments {ManagedNetwork<MirrorChannel, MirrorNode, string[], string[], string>}
 */
export default class MirrorNetwork extends ManagedNetwork {
    /**
     * @param {(address: string) => MirrorChannel} channelInitFunction
     */
    constructor(channelInitFunction) {
        super(channelInitFunction);
    }

    /**
     * @returns {string[]}
     */
    get network() {
        /**
         * @type {string[]}
         */
        var n = [];

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const node of this._nodes) {
            n.push(node.address.toString());
        }

        return n;
    }

    /**
     * @abstract
     * @param {string[]} network
     * @returns {string[]}
     */
    _createIterableNetwork(network) {
        return network;
    }

    /**
     * @abstract
     * @param {string} entry
     * @returns {MirrorNode}
     */
    _createNodeFromNetworkEntry(entry) {
        return new MirrorNode({
            newNode: {
                address: entry,
                channelInitFunction: this._createNetworkChannel,
            },
        }).setMinBackoff(this._minBackoff);
    }

    /**
     * @abstract
     * @param {string[]} network
     * @returns {number[]}
     */
    _getNodesToRemove(network) {
        const indexes = [];

        for (let i = this._nodes.length - 1; i >= 0; i--) {
            const node = this._nodes[i];

            if (!network.includes(node.address.toString())) {
                indexes.push(i);
            }
        }

        return indexes;
    }

    /**
     * @abstract
     * @param {MirrorNode} node
     */
    _removeNodeFromNetwork(node) {
        this._network.delete(node.address.toString());
    }

    /**
     * @abstract
     * @param {string} entry
     * @returns {boolean}
     */
    _checkNetworkContainsEntry(entry) {
        for (const node of this._nodes) {
            if (node.address.toString() === entry) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param {MirrorNode} node
     */
    _addNodeToNetwork(node) {
        this._network.set(node.address.toString(), node);
    }

    /**
     * @returns {MirrorNode}
     */
    getNextMirrorNode() {
        if (this._createNetworkChannel == null) {
            throw new Error("mirror network not supported on browser");
        }

        return this._getNumberOfMostHealthyNodes(1)[0];
    }
}
