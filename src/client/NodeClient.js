/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2022 Hedera Hashgraph, LLC
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

import fs from "fs";
import util from "util";
import Client from "./Client.js";
import NodeChannel from "../channel/NodeChannel.js";
import NodeMirrorChannel from "../channel/NodeMirrorChannel.js";
import AccountId from "../account/AccountId.js";
import LedgerId from "../LedgerId.js";

const readFileAsync = util.promisify(fs.readFile);

/**
 * @typedef {import("./Client.js").ClientConfiguration} ClientConfiguration
 */
//@typedef {import("./Client.js").NetworkName} NetworkName

export const Network = {
    /**
     * @param {string} name
     * @returns {{[key: string]: (string | AccountId)}}
     */
    fromName(name) {
        switch (name) {
            case "mainnet":
                return Network.MAINNET;

            case "testnet":
                return Network.TESTNET;

            case "previewnet":
                return Network.PREVIEWNET;

            default:
                throw new Error(`unknown network name: ${name}`);
        }
    },

    MAINNET: {
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
        "35.234.132.107:50211": new AccountId(13),
        "35.236.2.27:50211": new AccountId(14),
        "35.228.11.53:50211": new AccountId(15),
        "34.91.181.183:50211": new AccountId(16),
        "34.86.212.247:50211": new AccountId(17),
        "172.105.247.67:50211": new AccountId(18),
        "34.89.87.138:50211": new AccountId(19),
        "34.82.78.255:50211": new AccountId(20),
        "34.76.140.109:50211": new AccountId(21),
        "34.64.141.166:50211": new AccountId(22),
        "35.232.244.145:50211": new AccountId(23),
        "34.89.103.38:50211": new AccountId(24),
        "34.93.112.7:50211": new AccountId(25),
        "34.87.150.174:50211": new AccountId(26),
        "34.125.200.96:50211": new AccountId(27),
        "35.198.220.75:50211": new AccountId(28),
    },

    TESTNET: {
        "0.testnet.hedera.com:50211": new AccountId(3),
        "1.testnet.hedera.com:50211": new AccountId(4),
        "2.testnet.hedera.com:50211": new AccountId(5),
        "3.testnet.hedera.com:50211": new AccountId(6),
        "4.testnet.hedera.com:50211": new AccountId(7),
        "5.testnet.hedera.com:50211": new AccountId(8),
        "6.testnet.hedera.com:50211": new AccountId(9),
    },

    PREVIEWNET: {
        "0.previewnet.hedera.com:50211": new AccountId(3),
        "1.previewnet.hedera.com:50211": new AccountId(4),
        "2.previewnet.hedera.com:50211": new AccountId(5),
        "3.previewnet.hedera.com:50211": new AccountId(6),
        "4.previewnet.hedera.com:50211": new AccountId(7),
        "5.previewnet.hedera.com:50211": new AccountId(8),
        "6.previewnet.hedera.com:50211": new AccountId(9),
    },
};

export const MirrorNetwork = {
    /**
     * @param {string} name
     * @returns {string[]}
     */
    fromName(name) {
        switch (name) {
            case "mainnet":
                return MirrorNetwork.MAINNET;

            case "testnet":
                return MirrorNetwork.TESTNET;

            case "previewnet":
                return MirrorNetwork.PREVIEWNET;

            default:
                throw new Error(`unknown network name: ${name}`);
        }
    },

    MAINNET: ["hcs.mainnet.mirrornode.hedera.com:5600"],
    TESTNET: ["hcs.testnet.mirrornode.hedera.com:5600"],
    PREVIEWNET: ["hcs.previewnet.mirrornode.hedera.com:5600"],
};

/**
 * @augments {Client<NodeChannel, NodeMirrorChannel>}
 */
export default class NodeClient extends Client {
    /**
     * @param {ClientConfiguration} [props]
     */
    constructor(props) {
        super(props);

        if (props != null) {
            if (typeof props.network === "string") {
                switch (props.network) {
                    case "mainnet":
                        this.setNetwork(Network.MAINNET);
                        this.setMirrorNetwork(MirrorNetwork.MAINNET);
                        this.setLedgerId(LedgerId.MAINNET);
                        break;

                    case "testnet":
                        this.setNetwork(Network.TESTNET);
                        this.setMirrorNetwork(MirrorNetwork.TESTNET);
                        this.setLedgerId(LedgerId.TESTNET);
                        break;

                    case "previewnet":
                        this.setNetwork(Network.PREVIEWNET);
                        this.setMirrorNetwork(MirrorNetwork.PREVIEWNET);
                        this.setLedgerId(LedgerId.PREVIEWNET);
                        break;

                    default:
                        throw new Error(
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            `unknown network: ${props.network}`
                        );
                }
            } else if (props.network != null) {
                this.setNetwork(props.network);
            }

            if (typeof props.mirrorNetwork === "string") {
                switch (props.mirrorNetwork) {
                    case "mainnet":
                        this.setMirrorNetwork(MirrorNetwork.MAINNET);
                        break;

                    case "testnet":
                        this.setMirrorNetwork(MirrorNetwork.TESTNET);
                        break;

                    case "previewnet":
                        this.setMirrorNetwork(MirrorNetwork.PREVIEWNET);
                        break;

                    default:
                        this.setMirrorNetwork([props.mirrorNetwork]);
                        break;
                }
            } else if (props.mirrorNetwork != null) {
                this.setMirrorNetwork(props.mirrorNetwork);
            }
        }
    }

    /**
     * @param {string | ClientConfiguration} data
     * @returns {NodeClient}
     */
    static fromConfig(data) {
        return new NodeClient(
            typeof data === "string"
                ? /** @type {ClientConfiguration | undefined} */ (
                      JSON.parse(data)
                  )
                : data
        );
    }

    /**
     * @param {string} filename
     * @returns {Promise<NodeClient>}
     */
    static async fromConfigFile(filename) {
        return NodeClient.fromConfig(await readFileAsync(filename, "utf8"));
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
     * @param {{[key: string]: (string | AccountId)}} network
     * @returns {NodeClient}
     */
    static forNetwork(network) {
        return new NodeClient({ network });
    }

    /**
     * @param {string} network
     * @returns {NodeClient}
     */
    static forName(network) {
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

    /**
     * @param {{[key: string]: (string | AccountId)} | string} network
     * @returns {void}
     */
    setNetwork(network) {
        if (typeof network === "string") {
            switch (network) {
                case "previewnet":
                    this._network.setNetwork(Network.PREVIEWNET);
                    this._network._ledgerId = LedgerId.PREVIEWNET;
                    break;
                case "testnet":
                    this._network.setNetwork(Network.TESTNET);
                    this._network._ledgerId = LedgerId.TESTNET;
                    break;
                case "mainnet":
                    this._network.setNetwork(Network.MAINNET);
                    this._network._ledgerId = LedgerId.MAINNET;
            }
        } else {
            this._network.setNetwork(network);
        }
    }

    /**
     * @param {string[] | string} mirrorNetwork
     * @returns {this}
     */
    setMirrorNetwork(mirrorNetwork) {
        if (typeof mirrorNetwork === "string") {
            switch (mirrorNetwork) {
                case "previewnet":
                    this._mirrorNetwork.setNetwork(MirrorNetwork.PREVIEWNET);
                    break;
                case "testnet":
                    this._mirrorNetwork.setNetwork(MirrorNetwork.TESTNET);
                    break;
                case "mainnet":
                    this._mirrorNetwork.setNetwork(MirrorNetwork.MAINNET);
                    break;
                default:
                    this._mirrorNetwork.setNetwork([mirrorNetwork]);
            }
        } else {
            this._mirrorNetwork.setNetwork(mirrorNetwork);
        }

        return this;
    }

    /**
     * @override
     * @returns {(address: string, cert?: string) => NodeChannel}
     */
    _createNetworkChannel() {
        return (address, cert) => new NodeChannel(address, cert);
    }

    /**
     * @override
     * @returns {(address: string) => NodeMirrorChannel}
     */
    _createMirrorNetworkChannel() {
        return (address) => new NodeMirrorChannel(address);
    }
}
