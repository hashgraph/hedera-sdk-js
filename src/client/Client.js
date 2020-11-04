import AccountId from "../account/AccountId.js";
import AccountBalanceQuery from "../account/AccountBalanceQuery.js";
import { PrivateKey, PublicKey } from "@hashgraph/cryptography";
import Hbar from "../Hbar.js";
import Node from "../Node.js";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../channel/MirrorChannel.js").default} MirrorChannel
 */

/**
 * @typedef {"mainnet" | "testnet" | "previewnet"} NetworkName
 */

/**
 * @typedef {object} Operator
 * @property {string | PrivateKey} privateKey
 * @property {string | AccountId} accountId
 */

/**
 * @typedef {object} ClientOperator
 * @property {PublicKey} publicKey
 * @property {AccountId} accountId
 * @property {(message: Uint8Array) => Promise<Uint8Array>} transactionSigner
 */

/**
 * @typedef {object} ClientConfiguration
 * @property {{[key: string]: (string | AccountId)} | NetworkName} network
 * @property {string[] | NetworkName | string} [mirrorNetwork]
 * @property {Operator} [operator]
 */

/**
 * @abstract
 * @template {Channel} ChannelT
 * @template {MirrorChannel} MirrorChannelT
 */
export default class Client {
    /**
     * @protected
     * @hideconstructor
     * @param {ClientConfiguration} [props]
     */
    constructor(props) {
        /**
         * List of mirror network URLs.
         *
         * @private
         * @type {string[]}
         */
        this._mirrorNetwork = [];

        /**
         * Map of the mirror network URL to
         * its gRPC channel implementation.
         *
         * @private
         * @type {Map<string, MirrorChannelT>}
         */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this._mirrorChannels = new Map();

        /**
         * @private
         * @type {number}
         */
        this._nextMirrorIndex = 0;

        /**
         * Map of node account ID (as a string)
         * to the node URL.
         *
         * @private
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
        this._networkNodeAccountIds = [];

        /**
         * Keeps track of when the last time we sorted `this._networkNodeAccountIds`
         * If this timestamp is more than 1s then we should sort the list again.
         *
         * @private
         * @type {number}
         */
        this._lastSortedNodeAccountIds = Date.now();

        /**
         * @internal
         * @type {?ClientOperator}
         */
        this._operator = null;

        /**
         * @private
         * @type {Hbar}
         */
        this._maxTransactionFee = new Hbar(2);

        /**
         * @private
         * @type {Hbar}
         */
        this._maxQueryPayment = new Hbar(1);

        if (props != null) {
            if (props.operator != null) {
                this.setOperator(
                    props.operator.accountId,
                    props.operator.privateKey
                );
            }
        }
    }

    /**
     * @param {{[key: string]: (string | AccountId)} | NetworkName} network
     * @returns {void}
     */
    setNetwork(network) {
        this._closeNetworkChannels();
        this._networkNodeAccountIds = [];
        this._network.clear();

        for (const [url, accountId] of Object.entries(network)) {
            const key =
                accountId instanceof AccountId
                    ? accountId
                    : AccountId.fromString(accountId);

            const nodeId = new Node(key, url, this._createNetworkChannel());
            this._network.set(key.toString(), nodeId);
            this._networkNodeAccountIds.push(nodeId);
        }
    }

    /**
     * @param {string[]} mirrorNetwork
     * @returns {void}
     */
    setMirrorNetwork(mirrorNetwork) {
        this._closeMirrorNetworkChannels();
        this._mirrorNetwork = mirrorNetwork;
    }

    /**
     * Set the account that will, by default, pay for transactions and queries built with this client.
     *
     * @param {AccountId | string} accountId
     * @param {PrivateKey | string} privateKey
     * @returns {this}
     */
    setOperator(accountId, privateKey) {
        const key =
            typeof privateKey === "string"
                ? PrivateKey.fromString(privateKey)
                : privateKey;

        return this.setOperatorWith(accountId, key.publicKey, (message) =>
            Promise.resolve(key.sign(message))
        );
    }

    /**
     * Sets the account that will, by default, pay for transactions and queries built with
     * this client.
     *
     * @param {AccountId | string} accountId
     * @param {PublicKey | string} publicKey
     * @param {(message: Uint8Array) => Promise<Uint8Array>} transactionSigner
     * @returns {this}
     */
    setOperatorWith(accountId, publicKey, transactionSigner) {
        this._operator = {
            transactionSigner,

            accountId:
                accountId instanceof AccountId
                    ? accountId
                    : AccountId.fromString(accountId),

            publicKey:
                publicKey instanceof PublicKey
                    ? publicKey
                    : PublicKey.fromString(publicKey),
        };

        return this;
    }

    /**
     * @returns {?AccountId}
     */
    get operatorAccountId() {
        return this._operator != null ? this._operator.accountId : null;
    }

    /**
     * @returns {?PublicKey}
     */
    get operatorPublicKey() {
        return this._operator != null ? this._operator.publicKey : null;
    }

    /**
     * @returns {Hbar}
     */
    get maxTransactionFee() {
        return this._maxTransactionFee;
    }

    /**
     * Set the maximum fee to be paid for transactions
     * executed by this client.
     *
     * @param {Hbar} maxTransactionFee
     * @returns {this}
     */
    setMaxTransactionFee(maxTransactionFee) {
        this._maxTransactionFee = maxTransactionFee;
        return this;
    }

    /**
     * @returns {Hbar}
     */
    get maxQueryPayment() {
        return this._maxQueryPayment;
    }

    /**
     * Set the maximum payment allowable for queries.
     *
     * @param {Hbar} maxQueryPayment
     * @returns {Client<ChannelT, MirrorChannelT>}
     */
    setMaxQueryPayment(maxQueryPayment) {
        this._maxQueryPayment = maxQueryPayment;
        return this;
    }

    /**
     * @param {AccountId | string} accountId
     */
    async ping(accountId) {
        await new AccountBalanceQuery({ accountId }).execute(this);
    }

    /**
     * @returns {void}
     */
    close() {
        this._closeNetworkChannels();
        this._closeMirrorNetworkChannels();
    }

    /**
     * @private
     */
    _closeNetworkChannels() {
        for (const node of this._network.values()) {
            node.close();
        }
    }

    /**
     * @private
     */
    _closeMirrorNetworkChannels() {
        for (const mirrorChannel of this._mirrorChannels.values()) {
            mirrorChannel.close();
        }

        this._mirrorChannels.clear();
        this._nextMirrorIndex = 0;
    }

    /**
     * @internal
     * @returns {number}
     */
    _getNumberOfNodesForTransaction() {
        return (this._network.size + 3 - 1) / 3;
    }

    /**
     * @internal
     * @returns {AccountId[]}
     */
    _getNodeAccountIdsForExecute() {
        // Sort the network nodes array by healtiness and delay
        if (this._lastSortedNodeAccountIds + 1000 < Date.now()) {
            this._networkNodeAccountIds.sort((a, b) => {
                if (a.isHealthy() && b.isHealthy()) {
                    return 1;
                } else if (a.isHealthy() && !b.isHealthy()) {
                    return -1;
                } else if (!a.isHealthy() && b.isHealthy()) {
                    return 1;
                } else {
                    const aLastUsed = a.lastUsed != null ? a.lastUsed : 0;
                    const bLastUsed = b.lastUsed != null ? b.lastUsed : 0;

                    if (aLastUsed + a.delay < bLastUsed + b.delay) {
                        return -1;
                    } else {
                        return 1;
                    }
                }
            });

            this._lastSortedNodeAccountIds = Date.now();
        }

        return this._networkNodeAccountIds
            .slice(0, this._getNumberOfNodesForTransaction())
            .map((node) => node.accountId);
    }

    /**
     * @internal
     * @param {AccountId} nodeAccountId
     * @returns {Node<ChannelT> | undefined}
     */
    _getNodeByAccountId(nodeAccountId) {
        return this._network.get(nodeAccountId.toString());
    }

    /**
     * @internal
     * @returns {string}
     */
    _getNextMirrorAddress() {
        const address = this._mirrorNetwork[this._nextMirrorIndex++];
        this._nextMirrorIndex %= this._mirrorNetwork.length;

        return address;
    }

    /**
     * @internal
     * @param {string} address
     * @returns {MirrorChannelT}
     */
    _getMirrorChannel(address) {
        let mirrorChannel = this._mirrorChannels.get(address);

        if (mirrorChannel != null) {
            return mirrorChannel;
        }

        mirrorChannel = this._createMirrorNetworkChannel(address);

        this._mirrorChannels.set(address, mirrorChannel);

        return mirrorChannel;
    }

    /**
     * @abstract
     * @returns {(address: string) => ChannelT}
     */
    _createNetworkChannel() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {string} address
     * @returns {MirrorChannelT}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _createMirrorNetworkChannel(address) {
        throw new Error("not implemented");
    }
}
