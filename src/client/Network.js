import AccountId from "../account/AccountId.js";
import Node from "../Node.js";
import { _ledgerIdToNetworkName } from "../NetworkName.js";
import {
    PREVIEWNET_ADDRESS_BOOK,
    TESTNET_ADDRESS_BOOK,
    MAINNET_ADDRESS_BOOK,
} from "../address_book/AddressBooks.js";
import ManagedNetwork from "./ManagedNetwork.js";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../address_book/NodeAddressBook.js").default} NodeAddressBook
 */

/**
 * @typedef {import("./Client.js").NetworkName} NetworkName
 */

/**
 * @augments {ManagedNetwork<Channel, Node, {[key: string]: (string | AccountId)}, [string, (string | AccountId)][], [string, (string | AccountId)]>}
 */
export default class Network extends ManagedNetwork {
    /**
     * @param {(address: string) => Channel} createNetworkChannel
     */
    constructor(createNetworkChannel) {
        super(createNetworkChannel);

        this._maxNodesPerTransaction = -1;

        /** @type {NodeAddressBook | null} */
        this._addressBook = null;
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
        for (const node of this._nodes) {
            n[node.address.toString()] = node.accountId;
        }

        return n;
    }

    /**
     * @param {NetworkName} networkName
     * @returns {this}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setNetworkName(networkName) {
        super.setNetworkName(networkName);

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

        return this;
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
     * @abstract
     * @param {{[key: string]: (string | AccountId)}} network
     * @returns {[string, (string | AccountId)][]}
     */
    _createIterableNetwork(network) {
        return Object.entries(network);
    }

    /**
     * @abstract
     * @param {[string, (string | AccountId)]} entry
     * @returns {Node}
     */
    _createNodeFromNetworkEntry(entry) {
        const accountId =
            typeof entry[1] === "string"
                ? AccountId.fromString(entry[1])
                : entry[1];

        return new Node({
            newNode: {
                address: entry[0],
                accountId,
                channelInitFunction: this._createNetworkChannel,
            },
        }).setMinBackoff(this._minBackoff);
    }

    /**
     * @abstract
     * @param {{[key: string]: (string | AccountId)}} network
     * @returns {number[]}
     */
    _getNodesToRemove(network) {
        const indexes = [];

        for (let i = this._nodes.length - 1; i >= 0; i--) {
            const node = this._nodes[i];
            const accountId = network[node.address.toString()];

            if (accountId == null || accountId !== node.accountId.toString()) {
                indexes.push(i);
            }
        }

        return indexes;
    }

    /**
     * @abstract
     * @param {Node} node
     */
    _removeNodeFromNetwork(node) {
        this._network.delete(node.accountId.toString());
    }

    /**
     * @abstract
     * @param {[string, (string | AccountId)]} entry
     * @returns {boolean}
     */
    _checkNetworkContainsEntry(entry) {
        for (const node of this._nodes) {
            if (node.address.toString() === entry[0]) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param {Node} node
     */
    _addNodeToNetwork(node) {
        this._network.set(node.accountId.toString(), node);
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
}
