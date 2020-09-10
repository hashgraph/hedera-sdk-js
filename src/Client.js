import AccountId from "./account/AccountId";
import Channel from "./Channel";
import { PrivateKey, PublicKey } from "@hashgraph/cryptography";
import Hbar from "./Hbar";

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

const MAINNET = {
    "35.237.200.180:50211": new AccountId(3),
    "35.186.191.247:50211": new AccountId(4),
    "35.192.2.25:50211": new AccountId(5),
    "35.199.161.108:50211": new AccountId(6),
    "35.203.82.240:50211": new AccountId(7),
    "35.236.5.219:50211": new AccountId(8),
    "35.197.192.225:50211": new AccountId(9),
    "35.242.233.154:50211": new AccountId(10),
    "35.240.118.96:50211": new AccountId(11),
    "35.204.86.32:50211": new AccountId(12),
};

const TESTNET = {
    "0.testnet.hedera.com:50211": new AccountId(3),
    "1.testnet.hedera.com:50211": new AccountId(4),
    "2.testnet.hedera.com:50211": new AccountId(5),
    "3.testnet.hedera.com:50211": new AccountId(6),
};

const PREVIEWNET = {
    "0.previewnet.hedera.com:50211": new AccountId(3),
    "1.previewnet.hedera.com:50211": new AccountId(4),
    "2.previewnet.hedera.com:50211": new AccountId(5),
    "3.previewnet.hedera.com:50211": new AccountId(6),
};

export default class Client {
    /**
     * @private
     * @hideconstructor
     * @param {object} props
     * @param {{[key: string]: (string | AccountId)} | NetworkName} props.network
     * @param {string[] | NetworkName} [props.mirrorNetwork]
     * @param {Operator} [props.operator]
     */
    constructor(props) {
        /**
         * @private
         * @type {Map<string, string>}
         */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this._network = new Map();

        /**
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

        if (typeof props.network === "string") {
            switch (props.network) {
                case "mainnet":
                    this._setNetwork(MAINNET);
                    break;

                case "testnet":
                    this._setNetwork(TESTNET);
                    break;

                case "previewnet":
                    this._setNetwork(PREVIEWNET);
                    break;

                default:
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    throw new Error(`unknown network: ${props.network}`);
            }
        } else {
            this._setNetwork(props.network);
        }

        if (props.operator != null) {
            this.setOperator(
                props.operator.accountId,
                props.operator.privateKey
            );
        }
    }

    /**
     * @private
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
     * Construct a client for a specific network.
     *
     * It is the responsibility of the caller to ensure that all nodes in the map are part of the
     * same Hedera network. Failure to do so will result in undefined behavior.
     *
     * The client will load balance all requests to Hedera using a simple round-robin scheme to
     * chose nodes to send transactions to. For one transaction, at most 1/3 of the nodes will be
     * tried.
     *
     * @param {{[key: string]: (string | AccountId)} | NetworkName} network
     * @returns {Client}
     */
    static forNetwork(network) {
        return new Client({ network });
    }

    /**
     * Construct a Hedera client pre-configured for Mainnet access.
     *
     * @returns {Client}
     */
    static forMainnet() {
        return new Client({ network: "mainnet" });
    }

    /**
     * Construct a Hedera client pre-configured for Testnet access.
     *
     * @returns {Client}
     */
    static forTestnet() {
        return new Client({ network: "testnet" });
    }

    /**
     * Construct a Hedera client pre-configured for Previewnet access.
     *
     * @returns {Client}
     */
    static forPreviewnet() {
        return new Client({ network: "previewnet" });
    }

    /**
     * Set the account that will, by default, pay for transactions and queries built with this client.
     *
     * @param {AccountId | string} accountId
     * @param {PrivateKey | string} privateKey
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
        return this._operator ?? null;
    }

    /**
     * Get the account ID of the operator.
     *
     * @returns {?AccountId}
     */
    getOperatorId() {
        return this._operator?.accountId ?? null;
    }

    /**
     * Get the public key of the operator.
     *
     * @returns {?PublicKey}
     */
    getOperatorKey() {
        return this._operator?.publicKey ?? null;
    }

    /**
     * Set the maximum fee to be paid for transactions executed by this client.
     *
     * @param {Hbar} maxTransactionFee
     * @returns {Client}
     */
    setMaxTransactionFee(maxTransactionFee) {
        this._maxTransactionFee = maxTransactionFee;

        return this;
    }

    /**
     * Set the maximum payment allowable for queries.
     *
     * @param {Hbar} maxQueryPayment
     * @returns {Client}
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
     * @returns {Channel}
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

        networkChannel = new Channel(address);

        this._networkChannels.set(nodeId, networkChannel);

        return networkChannel;
    }
}
