import AccountId from "../account/AccountId";
import { PrivateKey, PublicKey } from "@hashgraph/cryptography";
import Hbar from "../Hbar";

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
 * @template ChannelT
 * @template MirrorChannelT
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
         * @type {Map<string, string>}
         */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this._network = new Map();

        /**
         * List of node account IDs.
         *
         * @private
         * @type {AccountId[]}
         */
        this._networkNodes = [];

        /**
         * @private
         * @type {number}
         */
        this._nextNetworkNodeIndex = 0;

        /**
         * @private
         * @type {Map<AccountId, ChannelT>}
         */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this._networkChannels = new Map();

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
     * @protected
     * @param {{[key: string]: (string | AccountId)}} network
     */
    setNetwork(network) {
        // TODO: close existing channels
        this._networkChannels.clear();
        this._network.clear();
        this._nextNetworkNodeIndex = 0;

        for (const [url, accountId] of Object.entries(network)) {
            const key =
                accountId instanceof AccountId
                    ? accountId
                    : AccountId.fromString(accountId);

            this._network.set(key.toString(), url);
            this._networkNodes.push(key);
        }
    }

    /**
     * @param {string[]} mirrorNetwork
     * @returns {void}
     */
    setMirrorNetwork(mirrorNetwork) {
        // TODO: close existing channels
        this._mirrorChannels.clear();
        this._nextMirrorIndex = 0;
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
     * @internal
     * @returns {number}
     */
    _getNumberOfNodesForTransaction() {
        return (this._network.size + 3 - 1) / 3;
    }

    /**
     * @internal
     * @returns {AccountId}
     */
    _getNextNodeId() {
        const nodeId = this._networkNodes[this._nextNetworkNodeIndex++];
        this._nextNetworkNodeIndex %= this._networkNodes.length;

        return nodeId;
    }

    /**
     * @internal
     * @param {AccountId} nodeId
     * @returns {ChannelT}
     */
    _getNetworkChannel(nodeId) {
        let networkChannel = this._networkChannels.get(nodeId);

        if (networkChannel != null) {
            return networkChannel;
        }

        const address = this._network.get(nodeId.toString());

        if (address == null) {
            throw new Error(`unknown node: ${nodeId.toString()}`);
        }

        networkChannel = this._createNetworkChannel(address);

        this._networkChannels.set(nodeId, networkChannel);

        return networkChannel;
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
     * @param {string} address
     * @returns {ChannelT}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _createNetworkChannel(address) {
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
