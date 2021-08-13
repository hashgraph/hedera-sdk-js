import AccountId from "../account/AccountId.js";
import Node from "../Node.js";
import { _ledgerIdToNetworkName, _ledgerIdToLedgerId } from "../NetworkName.js";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 */

/**
 * @typedef {import("./Client.js").NetworkName} NetworkName
 */

/**
 * @template {Channel} ChannelT
 */
export default class Network {
    /**
     * @param {(address: string) => ChannelT} createNetworkChannel
     */
    constructor(createNetworkChannel) {
        /**
         * @type {{[key: string]: (string | AccountId)}}
         */
        this.network = {};

        /**
         * Map of node account ID (as a string)
         * to the node URL.
         *
         * @internal
         * @type {Map<string, Node<ChannelT>>}
         */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.networkNodes = new Map();

        /**
         * List of node account IDs.
         *
         * @private
         * @type {Node<ChannelT>[]}
         */
        this.nodes = [];

        /** @type {(address: string) => ChannelT} */
        this.createNetworkChannel = createNetworkChannel;

        /** @type {string | null} */
        this._ledgerId = null;

        /** @type {number} */
        this._nodeWaitTime = 250;

        /** @type {number} */
        this._maxNodeAttempts = -1;

        this._maxNodesPerTransaction = -1;
    }

    /**
     * @param {NetworkName} networkName
     * @returns {void}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setNetworkName(networkName) {
        this._ledgerId = _ledgerIdToLedgerId(networkName);
    }

    /**
     * @returns {string | null}
     */
    get networkName() {
        return this._ledgerId != null
            ? _ledgerIdToNetworkName(this._ledgerId)
            : null;
    }

    /**
     * @param {{[key: string]: (string | AccountId)}} network
     */
    setNetwork(network) {
        const network_ = Object.entries(network);
        const thisNetwork_ = Object.entries(this.network);

        // Remove address that no longer exist
        for (const [url, accountId] of thisNetwork_) {
            const key =
                accountId instanceof AccountId
                    ? accountId
                    : AccountId.fromString(accountId);

            // eslint-disable-next-line ie11/no-loop-func,@typescript-eslint/no-unused-vars
            const index = network_.findIndex(([url_, _]) => url_ === url);
            if (index < 0) {
                const node = this.networkNodes.get(key.toString());
                if (node != null) {
                    node.close();
                }

                this.networkNodes.delete(key.toString());

                const nodesIndex = this.nodes.findIndex(
                    // eslint-disable-next-line ie11/no-loop-func
                    (node) => node.address === url
                );
                if (nodesIndex >= 0) {
                    this.nodes.splice(nodesIndex, 1);
                }
            }
        }

        // Add new address to the list
        for (const [url, accountId] of network_) {
            const key =
                accountId instanceof AccountId
                    ? accountId
                    : AccountId.fromString(accountId);

            // eslint-disable-next-line ie11/no-loop-func,@typescript-eslint/no-unused-vars
            const index = thisNetwork_.findIndex(([url_, _]) => url_ === url);
            if (index < 0) {
                const node = new Node(
                    key,
                    url,
                    this._nodeWaitTime,
                    this.createNetworkChannel
                );
                this.networkNodes.set(key.toString(), node);

                this.nodes.push(node);
            }
        }

        shuffle(this.nodes);

        this.network = network;
        this._ledgerId = null;
    }

    /**
     * @returns {number}
     */
    get maxNodesPerTransaction() {
        return this._maxNodesPerTransaction;
    }

    /**
     * @param {number} maxNodesPerTransaction
     * @returns {this}
     */
    setMaxNodesPerTransaction(maxNodesPerTransaction) {
        this._maxNodesPerTransaction = maxNodesPerTransaction;
        return this;
    }

    /**
     * @returns {number}
     */
    get maxNodeAttempts() {
        return this._maxNodeAttempts;
    }

    /**
     * @param {number} maxNodeAttempts
     * @returns {this}
     */
    setMaxNodeAttempts(maxNodeAttempts) {
        this._maxNodeAttempts = maxNodeAttempts;
        return this;
    }

    /**
     * @returns {number}
     */
    get nodeWaitTime() {
        return this._nodeWaitTime;
    }

    /**
     * @param {number} nodeWaitTime
     * @returns {this}
     */
    setNodeWaitTime(nodeWaitTime) {
        this._nodeWaitTime = nodeWaitTime;
        for (const node of this.nodes) {
            node.setWaitTime(nodeWaitTime);
        }
        return this;
    }

    /**
     * @internal
     * @returns {number}
     */
    getNumberOfNodesForTransaction() {
        if (this._maxNodesPerTransaction > 0) {
            return this._maxNodesPerTransaction;
        }

        return (this.nodes.length + 3 - 1) / 3;
    }

    /**
     * @internal
     * @returns {AccountId[]}
     */
    getNodeAccountIdsForExecute() {
        if (this._maxNodeAttempts > 0) {
            for (let i = 0; i < this.nodes.length; i++) {
                const node = this.nodes[i];

                if (node.attempts < this._maxNodeAttempts) {
                    continue;
                }

                node.close();
                delete this.network[node.address];
                this.networkNodes.delete(node.accountId.toString());

                this.nodes.splice(i, 1);
                i--;
            }
        }

        this.nodes.sort((a, b) => a.compare(b));

        return this.nodes
            .slice(0, this.getNumberOfNodesForTransaction())
            .map((node) => node.accountId);
    }

    close() {
        for (const node of this.nodes) {
            node.close();
        }

        this.networkNodes.clear();
        this.nodes = [];
        this.network = {};
    }
}

/**
 * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 *
 * @template T
 * @param {Array<T>} array
 */
function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue,
        randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
}
