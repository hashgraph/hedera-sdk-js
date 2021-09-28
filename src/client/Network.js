import AccountId from "../account/AccountId.js";
import Node from "../Node.js";
import { _ledgerIdToNetworkName, _ledgerIdToLedgerId } from "../NetworkName.js";
import {
    PREVIEWNET_ADDRESS_BOOK,
    TESTNET_ADDRESS_BOOK,
    MAINNET_ADDRESS_BOOK,
} from "../address_book/AddressBooks.js";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../address_book/NodeAddressBook.js").default} NodeAddressBook
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
         * Map of node account ID (as a string)
         * to the node URL.
         *
         * @internal
         * @type {Map<string, Node<ChannelT>>}
         */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this._network = new Map();

        /**
         * List of node account IDs.
         *
         * @private
         * @type {Node<ChannelT>[]}
         */
        this._nodes = [];

        /** @type {(address: string, cert?: string) => ChannelT} */
        this._createNetworkChannel = createNetworkChannel;

        /** @type {string | null} */
        this._ledgerId = null;

        /** @type {number} */
        this._minBackoff = 250;

        /** @type {number} */
        this._maxNodeAttempts = -1;

        this._maxNodesPerTransaction = -1;

        /** @type {NodeAddressBook | null} */
        this._addressBook = null;

        this._transportSecurity = false;
    }

    /**
     * @returns {boolean}
     */
    isTransportSecurity() {
        return this._transportSecurity;
    }

    /**
     * @param {boolean} transportSecurity
     * @returns {this}
     */
    setTransportSecurity(transportSecurity) {
        if (this._transportSecurity != transportSecurity) {
            this._network.clear();

            for (let i = 0; i < this._nodes.length; i++) {
                let node = this._nodes[i];
                node.close();

                node = transportSecurity
                    ? node
                          .toSecure()
                          .setCert(this._ledgerId != null ? this._ledgerId : "")
                    : node.toInsecure();
                this._nodes[i] = node;
                this._network.set(node.accountId.toString(), node);
            }
        }

        this._transportSecurity = transportSecurity;
        return this;
    }

    /**
     * @returns {{[key: string]: (string | AccountId)}}
     */
    get network() {
        /**
         * @type {{[key: string]: (string | AccountId)}}
         */
        var n = {};

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, value] of this._network) {
            n[value.address.toString()] = value.accountId;
        }

        return n;
    }

    /**
     * @param {NetworkName} networkName
     * @returns {void}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setNetworkName(networkName) {
        this._ledgerId = _ledgerIdToLedgerId(networkName);

        switch (networkName) {
            case "mainnet":
                this._addressBook = MAINNET_ADDRESS_BOOK;
                break;
            case "testnet":
                this._addressBook = TESTNET_ADDRESS_BOOK;
                break;
            case "previewnet":
                this._addressBook = PREVIEWNET_ADDRESS_BOOK;
                break;
        }

        if (this._addressBook != null) {
            for (const node of this._nodes) {
                for (const address of this._addressBook.nodeAddresses) {
                    if (
                        address.accountId != null &&
                        address.accountId.toString() ===
                            node.accountId.toString()
                    ) {
                        node.setNodeAddress(address);
                    }
                }
            }
        }
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
                const node = this._network.get(key.toString());
                if (node != null) {
                    node.close();
                }

                this._network.delete(key.toString());

                const nodesIndex = this._nodes.findIndex(
                    // eslint-disable-next-line ie11/no-loop-func
                    (node) => node.address.toString() === url
                );
                if (nodesIndex >= 0) {
                    this._nodes.splice(nodesIndex, 1);
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
                const node = new Node({
                    newNode: {
                        address: url,
                        accountId: key,
                        channelInitFunction: this._createNetworkChannel,
                    },
                }).setMinBackoff(this.minBackoff);

                this._network.set(key.toString(), node);
                this._nodes.push(node);
            }
        }

        shuffle(this._nodes);

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
    get minBackoff() {
        return this._minBackoff;
    }

    /**
     * @param {number} minBackoff
     * @returns {this}
     */
    setMinBackoff(minBackoff) {
        this._minBackoff = minBackoff;
        for (const node of this._nodes) {
            node.setMinBackoff(minBackoff);
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

        return (this._nodes.length + 3 - 1) / 3;
    }

    /**
     * @internal
     * @returns {AccountId[]}
     */
    getNodeAccountIdsForExecute() {
        if (this._maxNodeAttempts > 0) {
            for (let i = 0; i < this._nodes.length; i++) {
                const node = this._nodes[i];

                if (node._attempts < this._maxNodeAttempts) {
                    continue;
                }

                node.close();
                delete this.network[node.address.toString()];
                this._network.delete(node.accountId.toString());

                this._nodes.splice(i, 1);
                i--;
            }
        }

        this._nodes.sort((a, b) => a.compare(b));

        return this._nodes
            .slice(0, this.getNumberOfNodesForTransaction())
            .map((node) => node.accountId);
    }

    close() {
        for (const node of this._nodes) {
            node.close();
        }

        this._network.clear();
        this._nodes = [];
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
