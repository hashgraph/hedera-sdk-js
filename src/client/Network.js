import AccountId from "../account/AccountId.js";
import Node from "../Node.js";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 */

/**
 * @typedef {import("./Client.js").NetworkName} NetworkName
 */

/**
 * @readonly
 * @type {{Preferred: "preferred", Required: "required", Disabled: "disabled"}}
 */
export const TlsMode = Object.freeze({
    Disabled: "disabled",
    Required: "required",
    Preferred: "preferred",
});

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

        /**
         * @internal
         * @type {Map<string, string>}
         */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this._nodeCertificates = new Map();

        /**
         * @internal
         * @type {TlsMode[keyof TlsMode]}
         */
        this._tlsMode = TlsMode.Preferred;
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
                const node = new Node(key, url, this.createNetworkChannel);
                this.networkNodes.set(key.toString(), node);

                this.nodes.push(node);
            }
        }

        shuffle(this.nodes);

        this.network = network;
    }

    /**
     * @internal
     * @returns {number}
     */
    getNumberOfNodesForTransaction() {
        const count = this.nodes
            .map((node) => /** @type {number} */ (node.isHealthy() ? 1 : 0))
            .reduce((sum, value) => (sum += value));

        return (count + 3 - 1) / 3;
    }

    /**
     * @internal
     * @returns {AccountId[]}
     */
    getNodeAccountIdsForExecute() {
        this.nodes.sort((a, b) => a.compare(b));

        let nodes = this.nodes;

        // if the TLS mode is set to require, nodes that do not have an
        // associated TLS certificate should not be picked
        if (this._tlsMode === TlsMode.Required) {
            nodes = nodes.filter((node) =>
                this._nodeCertificates.has(node.accountId.toString())
            );
        }

        return nodes
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
