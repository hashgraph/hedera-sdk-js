/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2023 Hedera Hashgraph, LLC
 * ​
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ‍
 */

import LedgerId from "../LedgerId.js";
import * as util from "../util.js";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../channel/MirrorChannel.js").default} MirrorChannel
 * @typedef {import("../Node.js").default} Node
 * @typedef {import("../MirrorNode.js").default} MirrorNode
 * @typedef {import("../address_book/NodeAddressBook.js").default} NodeAddressBook
 */

/**
 * @template {Channel | MirrorChannel} ChannelT
 * @typedef {import("../ManagedNode.js").default<ChannelT>} ManagedNode
 */

/**
 * @template {Channel | MirrorChannel} ChannelT
 * @template {ManagedNode<ChannelT>} NetworkNodeT
 * @template {{ toString: () => string }} KeyT
 */
export default class ManagedNetwork {
    /**
     * @param {(address: string) => ChannelT} createNetworkChannel
     */
    constructor(createNetworkChannel) {
        /**
         * Map of node account ID (as a string)
         * to the node URL.
         *
         * @internal
         * @type {Map<string, NetworkNodeT[]>}
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

        /**
         * List of node account IDs.
         *
         * @protected
         * @type {NetworkNodeT[]}
         */
        this._healthyNodes = [];

        /**
         * Count of unhealthy nodes.
         *
         * @protected
         * @type {number}
         */
        this._unhealthyNodesCount = 0;

        /** @type {(address: string, cert?: string) => ChannelT} */
        this._createNetworkChannel = createNetworkChannel;

        /** @type {LedgerId | null} */
        this._ledgerId = null;

        this._minBackoff = 8000;
        this._maxBackoff = 1000 * 60 * 60;

        /** @type {number} */
        this._maxNodeAttempts = -1;

        this._nodeMinReadmitPeriod = this._minBackoff;
        this._nodeMaxReadmitPeriod = this._maxBackoff;

        this._earliestReadmitTime = Date.now() + this._nodeMinReadmitPeriod;
    }

    /**
     * @deprecated
     * @param {string} networkName
     * @returns {this}
     */
    setNetworkName(networkName) {
        console.warn("Deprecated: Use `setLedgerId` instead");
        return this.setLedgerId(networkName);
    }

    /**
     * @deprecated
     * @returns {string | null}
     */
    get networkName() {
        console.warn("Deprecated: Use `ledgerId` instead");
        return this.ledgerId != null ? this.ledgerId.toString() : null;
    }

    /**
     * @param {string|LedgerId} ledgerId
     * @returns {this}
     */
    setLedgerId(ledgerId) {
        this._ledgerId =
            typeof ledgerId === "string"
                ? LedgerId.fromString(ledgerId)
                : ledgerId;
        return this;
    }

    /**
     * @returns {LedgerId | null}
     */
    get ledgerId() {
        return this._ledgerId != null ? this._ledgerId : null;
    }

    /**
     * @abstract
     * @param {[string, KeyT]} entry
     * @returns {NetworkNodeT}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _createNodeFromNetworkEntry(entry) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {Map<string, KeyT>} network
     * @returns {number[]}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _getNodesToRemove(network) {
        throw new Error("not implemented");
    }

    _removeDeadNodes() {
        if (this._maxNodeAttempts > 0) {
            for (let i = this._nodes.length - 1; i >= 0; i--) {
                const node = this._nodes[i];

                if (node._badGrpcStatusCount < this._maxNodeAttempts) {
                    continue;
                }

                this._closeNode(i);
            }
        }
    }

    _readmitNodes() {
        const now = Date.now();

        if (this._earliestReadmitTime <= now) {
            let nextEarliestReadmitTime = Number.MAX_SAFE_INTEGER;
            let searchForNextEarliestReadmitTime = true;

            outer: for (let i = 0; i < this._nodes.length; i++) {
                for (let j = 0; j < this._healthyNodes.length; j++) {
                    if (
                        searchForNextEarliestReadmitTime &&
                        this._nodes[i]._readmitTime > now
                    ) {
                        nextEarliestReadmitTime = Math.min(
                            this._nodes[i]._readmitTime,
                            nextEarliestReadmitTime
                        );
                    }

                    if (this._nodes[i] == this._healthyNodes[j]) {
                        continue outer;
                    }
                }

                searchForNextEarliestReadmitTime = false;

                if (this._nodes[i]._readmitTime <= now) {
                    // Decrement the unhealthy node count because the readmit time of the node
                    // has expired and we return it to the list of healthy nodes
                    this._unhealthyNodesCount--;
                    this._healthyNodes.push(this._nodes[i]);
                }
            }

            this._earliestReadmitTime = Math.min(
                Math.max(nextEarliestReadmitTime, this._nodeMinReadmitPeriod),
                this._nodeMaxReadmitPeriod
            );
        }
    }

    /**
     * @param {number} count
     * @returns {NetworkNodeT[]}
     */
    _getNumberOfMostHealthyNodes(count) {
        this._removeDeadNodes();

        /** @type {NetworkNodeT[]} */
        const nodes = [];
        const keys = new Set();
        const nodeAddresses = new Set();

        // `this.getNode()` uses `Math.random()` internally to fetch
        // nodes, this means _techically_ `this.getNode()` can return
        // the same exact node several times in a row, but we do not
        // want that. We want to get a random node that hasn't been
        // chosen before. We could use a while loop and just keep calling
        // `this.getNode()` until we get a list of `count` different nodes,
        // but a potential issue is if somehow the healthy list gets
        // corrupted or count is too large then the while loop would
        // run forever. To resolve this, instead of using a while, we use
        // a for loop where we call `this.getNode()` a max of
        // `this._healthyNodes.length` times. This can result in a shorter
        // list than `count`, but that is much better than running forever
        for (let i = 0; i < this._healthyNodes.length; i++) {
            if (
                nodes.length == count - this._unhealthyNodesCount &&
                nodes.length !== 0
            ) {
                break;
            }

            // Get a random node
            let node = this.getNode();
            if (
                !keys.has(node.getKey()) ||
                !nodeAddresses.has(node.address._address)
            ) {
                keys.add(node.getKey());
                nodeAddresses.add(node.address._address);
                nodes.push(node);
            } else {
                i--;
            }
        }

        return nodes;
    }

    /**
     * @param {number} i
     */
    _closeNode(i) {
        const node = this._nodes[i];

        node.close();
        this._removeNodeFromNetwork(node);
        this._nodes.splice(i, 1);
    }

    /**
     * @param {NetworkNodeT} node
     */
    _removeNodeFromNetwork(node) {
        const network = /** @type {NetworkNodeT[]} */ (
            this._network.get(node.getKey())
        );

        for (let j = 0; j < network.length; j++) {
            if (network[j] === node) {
                network.splice(j, 1);
                break;
            }
        }

        if (network.length === 0) {
            this._network.delete(node.getKey());
        }
    }

    /**
     * @param {Map<string, KeyT>} network
     * @returns {this}
     */
    _setNetwork(network) {
        /** @type {NetworkNodeT[]} */
        const newNodes = [];
        const newNodeKeys = new Set();
        const newNodeAddresses = new Set();

        /** @type {NetworkNodeT[]} */
        const newHealthyNodes = [];

        /** @type {Map<string, NetworkNodeT[]>} */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const newNetwork = new Map();

        // Remove nodes that are not in the new network
        for (const i of this._getNodesToRemove(network)) {
            this._closeNode(i);
        }

        // Copy all the unclosed nodes
        for (const node of this._nodes) {
            newNodes.push(node);
            newNodeKeys.add(node.getKey());
            newNodeAddresses.add(node.address.toString());
        }

        // Add new nodes
        for (const [key, value] of network) {
            if (
                newNodeKeys.has(value.toString()) &&
                newNodeAddresses.has(key)
            ) {
                continue;
            }
            newNodes.push(this._createNodeFromNetworkEntry([key, value]));
        }

        // Shuffle the nodes so we don't immediately pick the first nodes
        util.shuffle(newNodes);

        // Copy all the nodes into the healhty nodes list initially
        // and push the nodes into the network; this maintains the
        // shuffled state from `newNodes`
        for (const node of newNodes) {
            if (!node.isHealthy()) {
                continue;
            }

            newHealthyNodes.push(node);

            const newNetworkNodes = newNetwork.has(node.getKey())
                ? /** @type {NetworkNodeT[]} */ (newNetwork.get(node.getKey()))
                : [];
            newNetworkNodes.push(node);
            newNetwork.set(node.getKey(), newNetworkNodes);
        }

        // console.log(JSON.stringify(newNodes, null, 2));
        this._nodes = newNodes;
        this._healthyNodes = newHealthyNodes;
        this._network = newNetwork;
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

    /**
     * @returns {number}
     */
    get maxBackoff() {
        return this._maxBackoff;
    }

    /**
     * @param {number} maxBackoff
     * @returns {this}
     */
    setMaxBackoff(maxBackoff) {
        this._maxBackoff = maxBackoff;
        for (const node of this._nodes) {
            node.setMaxBackoff(maxBackoff);
        }
        return this;
    }

    /**
     * @returns {number}
     */
    get nodeMinReadmitPeriod() {
        return this._nodeMinReadmitPeriod;
    }

    /**
     * @param {number} nodeMinReadmitPeriod
     * @returns {this}
     */
    setNodeMinReadmitPeriod(nodeMinReadmitPeriod) {
        this._nodeMinReadmitPeriod = nodeMinReadmitPeriod;
        this._earliestReadmitTime = Date.now() + this._nodeMinReadmitPeriod;
        return this;
    }

    /**
     * @returns {number}
     */
    get nodeMaxReadmitPeriod() {
        return this._nodeMaxReadmitPeriod;
    }

    /**
     * @param {number} nodeMaxReadmitPeriod
     * @returns {this}
     */
    setNodeMaxReadmitPeriod(nodeMaxReadmitPeriod) {
        this._nodeMaxReadmitPeriod = nodeMaxReadmitPeriod;
        return this;
    }

    /**
     * @param {KeyT=} key
     * @returns {NetworkNodeT}
     */
    getNode(key) {
        this._readmitNodes();
        if (key != null && key != undefined) {
            // return /** @type {NetworkNodeT[]} */ (
            //     this._network.get(key.toString())
            // )[0];
            const lockedNodes = this._network.get(key.toString());
            if (lockedNodes) {
                return /** @type {NetworkNodeT[]} */ (lockedNodes)[0];
            } else {
                const nodes = Array.from(this._network.keys());
                const randomNodeAccountId =
                    nodes[Math.floor(Math.random() * nodes.length)];

                // We get the `randomNodeAccountId` from the network mapping,
                // so it cannot be `undefined`
                // @ts-ignore
                return this._network.get(randomNodeAccountId)[0];
            }
        } else {
            if (this._healthyNodes.length == 0) {
                throw new Error("failed to find a healthy working node");
            }

            return this._healthyNodes[
                Math.floor(Math.random() * this._healthyNodes.length)
            ];
        }
    }

    /**
     * @param {NetworkNodeT} node
     */
    increaseBackoff(node) {
        node.increaseBackoff();

        for (let i = 0; i < this._healthyNodes.length; i++) {
            if (this._healthyNodes[i] == node) {
                this._healthyNodes.splice(i, 1);
                // Increment the unhealthy node count because we
                // remove the current node from the healthy list
                this._unhealthyNodesCount++;
            }
        }
    }

    /**
     * @param {NetworkNodeT} node
     */
    decreaseBackoff(node) {
        node.decreaseBackoff();
    }

    close() {
        for (const node of this._nodes) {
            node.close();
        }

        this._network.clear();
        this._nodes = [];
    }
}
