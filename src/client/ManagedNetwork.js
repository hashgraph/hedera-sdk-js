import { _ledgerIdToNetworkName, _ledgerIdToLedgerId } from "../NetworkName.js";
// import {
//     PREVIEWNET_ADDRESS_BOOK,
//     TESTNET_ADDRESS_BOOK,
//     MAINNET_ADDRESS_BOOK,
// } from "../address_book/AddressBooks.js";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../channel/MirrorChannel.js").default} MirrorChannel
 * @typedef {import("../Node.js").default} Node
 * @typedef {import("../MirrorNode.js").default} MirrorNode
 * @typedef {import("../address_book/NodeAddressBook.js").default} NodeAddressBook
 */

/**
 * @typedef {import("./Client.js").NetworkName} NetworkName
 */

/**
 * @template {Channel | MirrorChannel} ChannelT
 * @typedef {import("../ManagedNode.js").default<ChannelT>} ManagedNode
 */

/**
 * @template {Channel | MirrorChannel} ChannelT
 * @template {Node | MirrorNode} NetworkNodeT
 * @template {*} SdkNetworkT
 * @template {{ [Symbol.iterator]: () => IterableIterator<SdkNetworkEntryT> }} IterableSdkNetworkT
 * @template {*} SdkNetworkEntryT
 */
export default class MangedNetwork {
    /**
     * @param {(address: string) => ChannelT} createNetworkChannel
     */
    constructor(createNetworkChannel) {
        /**
         * Map of node account ID (as a string)
         * to the node URL.
         *
         * @internal
         * @type {Map<string, NetworkNodeT>}
         */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this._network = new Map();

        /**
         * List of node account IDs.
         *
         * @protected
         * @type {NetworkNodeT[]}
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

                node = /** @type {NetworkNodeT} */ (
                    transportSecurity
                        ? node
                              .toSecure()
                              .setCert(
                                  this._ledgerId != null ? this._ledgerId : ""
                              )
                        : node.toInsecure()
                );
                this._nodes[i] = node;
                this._addNodeToNetwork(node);
            }
        }

        this._transportSecurity = transportSecurity;
        return this;
    }

    /**
     * @param {NetworkName} networkName
     * @returns {this}
     */
    setNetworkName(networkName) {
        this._ledgerId = _ledgerIdToLedgerId(networkName);
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
     * @param {SdkNetworkT} network
     * @returns {IterableSdkNetworkT}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _createIterableNetwork(network) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {SdkNetworkEntryT} entry
     * @returns {NetworkNodeT}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _createNodeFromNetworkEntry(entry) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {SdkNetworkT} network
     * @returns {number[]}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _getNodesToRemove(network) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {NetworkNodeT} node
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _removeNodeFromNetwork(node) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {SdkNetworkEntryT} entry
     * @returns {boolean}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _checkNetworkContainsEntry(entry) {
        throw new Error("not implemented");
    }

    /**
     * @param {NetworkNodeT} node
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _addNodeToNetwork(node) {
        throw new Error("not implemented");
    }

    /**
     * @param {SdkNetworkT} network
     * @returns {this}
     */
    setNetwork(network) {
        const iterableNetwork = this._createIterableNetwork(network);

        // Short circuit network creation
        if (this._nodes.length === 0) {
            for (const entry of iterableNetwork) {
                const node = this._createNodeFromNetworkEntry(entry);
                this._addNodeToNetwork(node);
                this._nodes.push(node);
            }
        }

        // Remove nodes that are not in the new network
        for (const i of this._getNodesToRemove(network)) {
            const node = this._nodes[i];
            node.close();
            this._removeNodeFromNetwork(node);
            this._nodes.splice(i, 1);
        }

        // Add new nodes
        for (const entry of iterableNetwork) {
            if (!this._checkNetworkContainsEntry(entry)) {
                const node = this._createNodeFromNetworkEntry(entry);
                this._addNodeToNetwork(node);
                this._nodes.push(node);
            }
        }

        shuffle(this._nodes);
        this._ledgerId = null;
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
