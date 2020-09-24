import AccountId from "../account/AccountId";
import Channel from "../channel/Channel.js";
import { PrivateKey, PublicKey } from "@hashgraph/cryptography";
import Hbar from "../Hbar";
import WebChannel from "../channel/WebChannel";

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
 * @typedef {object} ClientConstructorParameter
 * @property {{[key: string]: (string | AccountId)} | NetworkName} network
 * @property {string[] | NetworkName} [mirrorNetwork]
 * @property {Operator} [operator]
 */

/**
 * @abstract
 * @template ChannelT
 */
export default class Client {
    /**
     * @protected
     * @hideconstructor
     * @param {ClientConstructorParameter} props
     */
    constructor(props) {
        /**
         * @protected
         * @type {string[]}
         */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this._mirrorNetwork = [];

        /**
         * @protected
         * @type {Map<string, Channel>}
         */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this._mirrorChannels = new Map();

        /**
         * @protected
         * @type {number}
         */
        this._nextMirrorIndex = 0;

        /**
         * @protected
         * @type {Map<string, string>}
         */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this._network = new Map();

        /**
         * @protected
         * @type {AccountId[]}
         */
        this._networkNodes = [];

        /**
         * @protected
         * @type {number}
         */
        this._nextNetworkNodeIndex = 0;

        /**
         * @protected
         * @type {Map<AccountId, Channel>}
         */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this._networkChannels = new Map();

        /**
         * @internal
         * @type {?ClientOperator}
         */
        this._operator = null;

        /**
         * @internal
         * @type {Hbar}
         */
        this._maxTransactionFee = new Hbar(1);

        /**
         * @internal
         * @type {Hbar}
         */
        this._maxQueryPayment = new Hbar(1);

        if (props.operator != null) {
            this.setOperator(
                props.operator.accountId,
                props.operator.privateKey
            );
        }
    }

    /**
     * @protected
     * @param {{[key: string]: (string | AccountId)} | NetworkName} network
     */
    _setNetwork(network) {
        // TODO: close existing channels
        this._networkChannels.clear();
        this._network.clear();

        for (const [url, accountId] of Object.entries(network)) {
            const key =
                accountId instanceof AccountId
                    ? accountId
                    : AccountId.fromString(accountId);

            this._network.set(key.toString(), url);
            this._networkNodes.push(key);
        }

        this._nextNetworkNodeIndex = 0;
    }

    /**
     * @param {string[]} mirrorNetwork
     * @returns {void}
     */
    setMirrorNetwork(...mirrorNetwork) {
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

        return this.setOperatorWith(accountId, key.getPublicKey(), (message) =>
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
     * Get the account ID of the operator.
     *
     * @returns {?ClientOperator}
     */
    getOperator() {
        return this._operator;
    }

    /**
     * Get the account ID of the operator.
     *
     * @returns {?AccountId}
     */
    getOperatorId() {
        return this._operator != null ? this._operator.accountId : null;
    }

    /**
     * Get the public key of the operator.
     *
     * @returns {?PublicKey}
     */
    getOperatorKey() {
        return this._operator != null ? this._operator.publicKey : null;
    }

    /**
     * Set the maximum fee to be paid for transactions executed by this client.
     *
     * @param {Hbar} maxTransactionFee
     * @returns {Client<ChannelT>}
     */
    setMaxTransactionFee(maxTransactionFee) {
        this._maxTransactionFee = maxTransactionFee;

        return this;
    }

    /**
     * Set the maximum payment allowable for queries.
     *
     * @param {Hbar} maxQueryPayment
     * @returns {Client<ChannelT>}
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
     * @returns {Promise<Channel>}
     */
    async _getNetworkChannel(nodeId) {
        let networkChannel = this._networkChannels.get(nodeId);

        if (networkChannel != null) {
            return networkChannel;
        }

        const address = this._network.get(nodeId.toString());

        if (address == null) {
            throw new Error(`unknown node: ${nodeId.toString()}`);
        }

        networkChannel = await this._createNewChannel(address);

        this._networkChannels.set(nodeId, networkChannel);

        return networkChannel;
    }

    /**
     * @internal
     * @returns {string}
     */
    _getNextMirrorAddress() {
        const address = this._mirrorNetwork[this._nextMirrorIndex++];
        this._nextMirrorIndex %= this._networkNodes.length;

        return address;
    }

    /**
     * @internal
     * @param {string} address
     * @returns {Promise<Channel>}
     */
    async _getMirrorChannel(address) {
        let mirrorChannel = this._mirrorChannels.get(address);

        if (mirrorChannel != null) {
            return mirrorChannel;
        }

        mirrorChannel = await this._createNewChannel(address);

        this._mirrorChannels.set(address, mirrorChannel);

        return mirrorChannel;
    }

    /**
     * @abstract
     * @param {string} address
     * @returns {Promise<Channel>}
     */
    async _createNewChannel(address) {
        if (typeof Buffer === "undefined") {
            return new WebChannel(address);
        } else {
            return new (await import("../channel/NodeChannel")).default(
                address
            );
        }
    }
}
