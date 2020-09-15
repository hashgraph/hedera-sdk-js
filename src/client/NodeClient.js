import Client from "./Client";
import NodeChannel from "../channel/NodeChannel";
import AccountId from "../account/AccountId";

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

/**
 * @augments {Client<NodeChannel>}
 */
export default class NodeClient extends Client {
    /**
     * @param {import("./Client").ClientConstructorParameter} props
     */
    constructor(props) {
        super(props);

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
     * @param {{[key: string]: (string | AccountId)} | import("./Client").NetworkName} network
     * @returns {NodeClient}
     */
    static forNetwork(network) {
        return new NodeClient({ network });
    }

    /**
     * Construct a Hedera client pre-configured for Mainnet access.
     *
     * @returns {NodeClient}
     */
    static forMainnet() {
        return new NodeClient({ network: "mainnet" });
    }

    /**
     * Construct a Hedera client pre-configured for Testnet access.
     *
     * @returns {NodeClient}
     */
    static forTestnet() {
        return new NodeClient({ network: "testnet" });
    }

    /**
     * Construct a Hedera client pre-configured for Previewnet access.
     *
     * @returns {NodeClient}
     */
    static forPreviewnet() {
        return new NodeClient({ network: "previewnet" });
    }
}
