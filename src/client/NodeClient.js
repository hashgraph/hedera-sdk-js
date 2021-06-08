import fs from "fs";
import util from "util";
import Client from "./Client.js";
import NodeChannel from "../channel/NodeChannel.js";
import NodeMirrorChannel from "../channel/NodeMirrorChannel.js";
import AccountId from "../account/AccountId.js";
import { TlsMode } from "./Network.js";

const readFileAsync = util.promisify(fs.readFile);

/**
 * @typedef {import("./Client.js").ClientConfiguration} ClientConfiguration
 * @typedef {import("./Client.js").NetworkName} NetworkName
 */

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
        "35.237.200.180": new AccountId(3),
        "35.186.191.247": new AccountId(4),
        "35.192.2.25": new AccountId(5),
        "35.199.161.108": new AccountId(6),
        "35.203.82.240": new AccountId(7),
        "35.236.5.219": new AccountId(8),
        "35.197.192.225": new AccountId(9),
        "35.242.233.154": new AccountId(10),
        "35.240.118.96": new AccountId(11),
        "35.204.86.32": new AccountId(12),
        "35.234.132.107": new AccountId(13),
        "35.236.2.27": new AccountId(14),
        "35.228.11.53": new AccountId(15),
        "34.91.181.183": new AccountId(16),
        "34.86.212.247": new AccountId(17),
        "172.105.247.67": new AccountId(18),
        "34.89.87.138": new AccountId(19),
        "34.82.78.255": new AccountId(20),
    },

    TESTNET: {
        "0.testnet.hedera.com": new AccountId(3),
        "1.testnet.hedera.com": new AccountId(4),
        "2.testnet.hedera.com": new AccountId(5),
        "3.testnet.hedera.com": new AccountId(6),
        "4.testnet.hedera.com": new AccountId(7),
    },

    PREVIEWNET: {
        "0.previewnet.hedera.com": new AccountId(3),
        "1.previewnet.hedera.com": new AccountId(4),
        "2.previewnet.hedera.com": new AccountId(5),
        "3.previewnet.hedera.com": new AccountId(6),
        "4.previewnet.hedera.com": new AccountId(7),
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
                        this._setNodeCertificates(
                            networkTlsCertificates.MAINNET
                        );

                        break;

                    case "testnet":
                        this.setNetwork(Network.TESTNET);
                        this.setMirrorNetwork(MirrorNetwork.TESTNET);
                        this._setNodeCertificates(
                            networkTlsCertificates.TESTNET
                        );

                        break;

                    case "previewnet":
                        this.setNetwork(Network.PREVIEWNET);
                        this.setMirrorNetwork(MirrorNetwork.PREVIEWNET);
                        this._setNodeCertificates(
                            networkTlsCertificates.PREVIEWNET
                        );

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
            typeof data === "string" ? JSON.parse(data) : data
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
     * @param {NetworkName} network
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
     * @param {{[key: string]: (string | AccountId)} | NetworkName} network
     * @returns {void}
     */
    setNetwork(network) {
        if (typeof network === "string") {
            switch (network) {
                case "previewnet":
                    this._network.setNetwork(Network.PREVIEWNET);
                    break;
                case "testnet":
                    this._network.setNetwork(Network.TESTNET);
                    break;
                case "mainnet":
                    this._network.setNetwork(Network.MAINNET);
            }
        } else {
            this._network.setNetwork(network);
        }
    }

    /**
     * @param {string[] | string | NetworkName} mirrorNetwork
     * @returns {void}
     */
    setMirrorNetwork(mirrorNetwork) {
        if (typeof mirrorNetwork === "string") {
            switch (mirrorNetwork) {
                case "previewnet":
                    this._mirrorNetwork.setMirrorNetwork(
                        MirrorNetwork.PREVIEWNET
                    );
                    break;
                case "testnet":
                    this._mirrorNetwork.setMirrorNetwork(MirrorNetwork.TESTNET);
                    break;
                case "mainnet":
                    this._mirrorNetwork.setMirrorNetwork(MirrorNetwork.MAINNET);
                    break;
                default:
                    this._mirrorNetwork.setMirrorNetwork([mirrorNetwork]);
            }
        } else {
            this._mirrorNetwork.setMirrorNetwork(mirrorNetwork);
        }
    }

    /**
     * @override
     * @returns {(address: string) => NodeChannel}
     */
    _createNetworkChannel() {
        return (address) => {
            let nodeCertificate;

            if (this._network._tlsMode !== TlsMode.Disabled) {
                nodeCertificate = this._network._nodeCertificates.get(address);
            }

            return new NodeChannel(address, nodeCertificate);
        };
    }

    /**
     * @override
     * @returns {(address: string) => NodeMirrorChannel}
     */
    _createMirrorNetworkChannel() {
        return (address) => new NodeMirrorChannel(address);
    }
}

const networkTlsCertificates = {
    MAINNET: {
        "35.237.200.180":
            "-----BEGIN CERTIFICATE-----\nMIIEfzCCAuegAwIBAgIUdcZh1xxc7C/AqbIcbqAK28TxA/AwDQYJKoZIhvcNAQEM\nBQAwXTELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAk1JMRAwDgYDVQQHDAdMYW5zaW5n\nMQswCQYDVQQKDAJMRzEPMA0GA1UECwwGSGVkZXJhMREwDwYDVQQDDAgwMDAwMDAw\nMDAgFw0yMDA3MzExODAzMzVaGA8yMjk0MDUxNTE4MDMzNVowXTELMAkGA1UEBhMC\nVVMxCzAJBgNVBAgMAk1JMRAwDgYDVQQHDAdMYW5zaW5nMQswCQYDVQQKDAJMRzEP\nMA0GA1UECwwGSGVkZXJhMREwDwYDVQQDDAgwMDAwMDAwMDCCAaIwDQYJKoZIhvcN\nAQEBBQADggGPADCCAYoCggGBAMVaZf2zudk3rR2vxgVq0rrvtoBxBsU1K6tToaq1\nzSU3IRWs2UnJpp30GXw2DNFvqDfuM8D+DOYst/f+iA5NeyVeELJSlIjZIhNwhl4F\nb22ybohADVc9eSaFfd0rlymXtxtqU3XZ6rSc0PYEFrKZmkQ+s4driDbdvHT4Z4/n\nFgd80DJEYuksbpWlnoOFVcdVwqIy5znlsvINl3HLIxZTdzII2PxToFW2oqIcLU6w\nEcpN4g5qeDcQWLg7hJgmXUzf+vIyZssBjXeFWd+BZCD1VNvrwhlEKfiYtc/kahQi\nkpCC6UYgsUZrd8L7dl08mATnpT8S64NoSfBYO8JCDMFEOtX0eBwdMjGbwXSk+B0B\nTC5H2wg+NfcGhkp9aQUSjBg+yPNZNSLoDEzCmwXSxT346Nap0pBC8Ni24L3rdN4P\naWkwdKToggSd0mNT3Sg+gmmDzORIzEtstNtP6Js+LZBwK7gSSSnBWvuFgtnDPjTp\n3Y7Ila5ipQKz9dt5yR3GBqO+TwIDAQABozUwMzAPBgNVHREECDAGhwR/AAABMAsG\nA1UdDwQEAwIEMDATBgNVHSUEDDAKBggrBgEFBQcDATANBgkqhkiG9w0BAQwFAAOC\nAYEAumCt4uz2vR7OozKS19Izv9jxeGY+oqVRVWriZUH0W+L6KLc+Rf4obDN6I58P\n8hH+T9xOvZCOXE7suVwKgRLvC6mgTcUQKxaefvTRm6NBsNuebe9o43PdEo5oucDi\nGp/CFjRsWMLvJIZIx6dhNwTZzw87cPtgikHoEiSZS/a8VOYpBVGnOWoQT6qvLcyH\nEZb7Kq1gSeu4rwLcJfY9nHwGHlf8bzgjZDVF0esxeChszPSpHqY1W6D6qHudBly6\nFEbvsOw7jtCpZhJcIba9t2xWAaaw7Ts2sNUA9xIQnySuS+dWarHKkCF2lKWLY9TM\n+s67ePL5zQUMMbineYKUbcxIp2kJZmU/XeYznQTfkaDNaoNcDF5Z8EfBcInTwHhp\nhK7+TTm9GuQaDHyDwYHnyZWR6LRoSeKd7IK3syq9+C0R50rUtM8vR6K3bFzCBZMD\nkwcV85E1oLfrN9J68QJz01Q/EW9qBmqNCFESLkxI7qy/aitxyyN9mc8QyKaxZAt+\nijan\n-----END CERTIFICATE-----\n",
        "35.186.191.247":
            "-----BEGIN CERTIFICATE-----\nMIIEhzCCAu+gAwIBAgIUVoXBedW45WpPoXkl0lSlC1SDdSkwDQYJKoZIhvcNAQEM\nBQAwYTELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAk5DMQ8wDQYDVQQHDAZMZW5vaXIx\nEDAOBgNVBAoMB1N3aXJsZHMxDzANBgNVBAsMBkhlZGVyYTERMA8GA1UEAwwIMDAw\nMDAwMDEwIBcNMjAwNTE1MjE0NjM0WhgPMjI5NDAyMjcyMTQ2MzRaMGExCzAJBgNV\nBAYTAlVTMQswCQYDVQQIDAJOQzEPMA0GA1UEBwwGTGVub2lyMRAwDgYDVQQKDAdT\nd2lybGRzMQ8wDQYDVQQLDAZIZWRlcmExETAPBgNVBAMMCDAwMDAwMDAxMIIBojAN\nBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAvdy0YMdARK3O/xcGj0uMqeg7PZRc\ndyadJIbr8uWs24eO7O4mbsAbkWkMd668WxvHmrZDhJAAFDuBJgBE8DODbmiu9OOn\nQXbITn7wsTURlXnqq1QaeYRJyDJT+qodtgtkf0TGpvt/o6gxvn/JlQ1azj0nVyoZ\nYFX9wENKL+0k4s5VkoH+C0j/KEUJxJuBFOlK79wBASwAb/xLwviIdO49MlMnrAlr\nkZXN2W4zT3aSlLTp5akFZLVYZNYK/OSUDARD/jXKVyqyNzphRJsRH3w/tdmkGdHY\n9DxOIazdiPQ0gv3nw4f8m29kO6hRnNpk+OY7Jh+3ByRLrGajKHzfTbjL9I2AhPH3\nGgUSL9HuxDF3DvCBGTwjhT93V2DEMsRlDtU6Jsh78BuXPqzYRKpNmjJ2ebM/8hl4\natyFav14e6NwV5/aicTle99U6vU957oUe1ZUgzzNH4QoNZw++S8G752emEa4Irur\n9bjjGkaGOd9k7M9Toq11/P40cTaMkWzMCcirAgMBAAGjNTAzMA8GA1UdEQQIMAaH\nBH8AAAEwCwYDVR0PBAQDAgQwMBMGA1UdJQQMMAoGCCsGAQUFBwMBMA0GCSqGSIb3\nDQEBDAUAA4IBgQCc4YnkUtPcHsgwxr//aAgDgcsqCV9b+8kqn6qgtV1OMRuyFX44\nVU8qJKlBysetN9zT4dP+9wNwFPTzBvo6vD9K9yH5ZD+iDCadZlLYkVAr22VuWZYi\nzV76fGNaTccQjl6n0d8j329T6A5SgabsWQFRsfjLkdWACNLvGx8CbLLt3CfFHp6k\nijuBE50jBc4Zq0ZSF8sEejIHKN1WbzflQgs5841xtlsDBY/7f4esLNn2sUOs45SB\ndBq5yZ7808F8rbAK3CsXXW8goiTgPsNlifHAD+5e4m5xySZaTGZ8fmIEiDE+Wrjb\nJSUg6wjPBOFKlA2WWAbyiHG2lS+DolKQYifZLBMjQ0yCq2O4GQMCH76W0L1DTBsV\nUZ/ExKzEysDjtJRzvnVyz1M9N1OJztAI1Xav+RHiB1147I2wW7BdOD/W897+3Nyz\nczkQnP9UOsG8UtN5MIQfYPj9ArAbUe0YluQ+uHXSC6C+XfMkAJqj38lK4Fved3eG\nKTPVe51FeKKBI+s=\n-----END CERTIFICATE-----\n",
        "35.192.2.25":
            "-----BEGIN CERTIFICATE-----\nMIIEgzCCAuugAwIBAgIUTIz7pCbq7oce8biMR7UMVfDIqN8wDQYJKoZIhvcNAQEM\nBQAwXzELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAkZMMQ4wDAYDVQQHDAVUYW1wYTEP\nMA0GA1UECgwGQm9laW5nMQ8wDQYDVQQLDAZIZWRlcmExETAPBgNVBAMMCDAwMDAw\nMDAyMCAXDTIwMDUxNTIxNDcyM1oYDzIyOTQwMjI3MjE0NzIzWjBfMQswCQYDVQQG\nEwJVUzELMAkGA1UECAwCRkwxDjAMBgNVBAcMBVRhbXBhMQ8wDQYDVQQKDAZCb2Vp\nbmcxDzANBgNVBAsMBkhlZGVyYTERMA8GA1UEAwwIMDAwMDAwMDIwggGiMA0GCSqG\nSIb3DQEBAQUAA4IBjwAwggGKAoIBgQD8XZgsmShpS1JPiabsWyaCy7TIlo69DECa\n/UB2Qz8/vrCY7YrWs8Ah6JYPCi3YM5Hc0rzcITVB1MOtMpWlzCCUZbY36pPt2OoV\n1p++HGy8pQ/9qyrMTTo6gXhIS8B6/UboqohWM+Ql2kKRo1ivQ+1M4QbYzENrZLDD\n2xKVpPyOpJAQYALPOe89qgF/ua3OmhFtUEEAzgePabXXzPWfEWnu9Ri4kKpKYjke\naUvKEUYzdEvD1ic8fpYfhwv9lkMq+Hc11NjdFr5AFfypPRkDpEiXTKi+8y2W5U6N\nda2NVlxFpJwYseEKo+aAQbkOEq5D0fb9RpdgvqQ7r2gCREr5AEVLaCJ40nb6TR40\n3xnibjvDMrWqld3tYewsocydMJG9OAX3AgOcOwirtqEssTuXZyntHgfPScP1mA6d\nrYeqOygUCjeTJ8SQRapQ1TovLL6oFKiKmhEjgUtBbKV4YVeldXGOnx5wC+E3jga6\nCRMrnfB+iszxLxTayBAPZNjWkC1cfmkCAwEAAaM1MDMwDwYDVR0RBAgwBocEfwAA\nATALBgNVHQ8EBAMCBDAwEwYDVR0lBAwwCgYIKwYBBQUHAwEwDQYJKoZIhvcNAQEM\nBQADggGBAEE6GSr+kgxHrJey62fIbxPfDM41aXt9fAACo0kPc+kwlZhyPn5YfGcB\nXIK/m09No98OVTDjMmb9/6DcKL5MSBtHk8F72KdNCm2wBzKk2RrBbV2iPqqpsaON\ncsTuaEoWbZVVqAkoPbte7PMMHe58TeHv/y7P8AJGKreBRm9BQC3leO25hB8ZU5VQ\niCQ6tlUZpzfFZF7Va6hDE9CDZEPV58kj5hKDRapYIvOHRJvWS1Ob2ZQ46HaLcK6i\nh61sSfxvma8aUw0Z6xhG5oN9KHKwheqPQAM0aqQgn7cq+XomwHa35LaP73kmQpfv\nTLRqUynWG3pID6N7OoSQgzpHtJHSDEtZ49BmbxyWDUHFgno6ElD/PVhi2DEsUHiZ\nQIiMZBmY92j+sex4ac3iVkTwmZh/hDcYMWe0KRWa6SQt5eEia7Ay9p16W+T3HEQn\n/sDrZy7ahJK3wOwPcJSdQERJWJIn69Q+ujohyuIkqsOyzZ4wEVFczpd6TMw5yTZe\nu2lXMkxqJQ==\n-----END CERTIFICATE-----\n",
        "35.199.161.108":
            "-----BEGIN CERTIFICATE-----\nMIIEaTCCAtGgAwIBAgIUX0MYGm8nm/rc4wr7v6ieBe8XKvcwDQYJKoZIhvcNAQEM\nBQAwUjELMAkGA1UEBhMCSU4xDzANBgNVBAcMBk11bWJhaTEOMAwGA1UECgwFV2lw\ncm8xDzANBgNVBAsMBkhlZGVyYTERMA8GA1UEAwwIMDAwMDAwMDMwIBcNMjAwNzMx\nMTgxMTA5WhgPMjI5NDA1MTUxODExMDlaMFIxCzAJBgNVBAYTAklOMQ8wDQYDVQQH\nDAZNdW1iYWkxDjAMBgNVBAoMBVdpcHJvMQ8wDQYDVQQLDAZIZWRlcmExETAPBgNV\nBAMMCDAwMDAwMDAzMIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAwDQC\nkXswZwU1FUMTskiZijUZtiKL8uzkbCqE2408X5VdZqQvF0va7/rmhwxftHLbsKJQ\no+4t3nAyv+RwCkhXNVZLKHOQRtFTZxhGB5+jl41p2gA2iEY5wDOoS9rWoMdJCZ1j\n7tBAxlXk/M5tbc+AJDlS3ykN6bVYJEVw2hDxKcfSwtZ72sqXo0KU0InvBQywQBUP\nn5ffpsgv1SRKRQcDH3zP+rytU0oH0o+C6qlpQjbD89xufZP6JG1J8LaV1LTpRVrH\n9zmJB/0NofFf8pY6fpOurY9rjr1Asf9IIfxjqpPTZNi33wiGN8Q60R7Q/C9WIBzN\n1jZjHlxluKyoZLj5rB6OjIVjuWE1tv9J15xmo4TUDqjN7tdQql9Dr1X8uxpsFG5S\nIoL0TRvAUJlMo1XsBFPJuqG429817amVf6CUTM/QcIkad5mWST9aGbTaLj52+EyR\nxX6ABz1Ac5inuwY/FK5Fl6xN07roXb4yONKkNXGirFHUTWDNNV5Mm6UHUmBbAgMB\nAAGjNTAzMA8GA1UdEQQIMAaHBH8AAAEwCwYDVR0PBAQDAgQwMBMGA1UdJQQMMAoG\nCCsGAQUFBwMBMA0GCSqGSIb3DQEBDAUAA4IBgQBPWreb+O+JtAWzllxvFwVlAJV5\nUwZ4A94JjjBeLTKk2r7FK0BfbNnqWpH9GGCJ3u9UlCLVSJmXmJeqe3ELERQe6giX\nLMDlaE2BOUM7tnqq2gWwil/w1bamIeY3l+u3Jqs7dRnMt/PCAmrsfoAUbVMU3JQS\nhvRfkJqVvWaKpo+gB68IfAFS7UsvWwB+TNcbTVbAzz7Q3RF9J0OkolBP38+dUNtL\nwK8bCAdllmDg8vZJci64L7i/u0grY+Q3kmT5JoyLEkS29NitS4k9kWzBjw9ScYWY\nAd124+oma/VpuuJCnKmABOEPPNX86MKV5F0zYPUa/orcxjgaw8lAIpG3VM+Xv49d\nhJvH9faLfbna2iGfj8EqJ1oY47HWNnHcm4YOHaoZOJ0riGm6JWzSITkuYYFe4WS5\nsBjL9+/6h2Cn8c70tJ81LU8Jn+K6MNWEDda8KzjEuAQUZ1WlC11ytXo6Bm0acAJa\npI1QyEIY4SZEqKyslQsxCcxcc1HQSOnHVrgXVEM=\n-----END CERTIFICATE-----\n",
        "35.203.82.240":
            "-----BEGIN CERTIFICATE-----\nMIIEaTCCAtGgAwIBAgIUKfo1UUIxVGnJVAbEPbNlw5fp8m8wDQYJKoZIhvcNAQEM\nBQAwUjELMAkGA1UEBhMCSlAxDjAMBgNVBAcMBVRva3lvMQ8wDQYDVQQKDAZOb211\ncmExDzANBgNVBAsMBkhlZGVyYTERMA8GA1UEAwwIMDAwMDAwMDQwIBcNMjAwNzMx\nMTgxMjEyWhgPMjI5NDA1MTUxODEyMTJaMFIxCzAJBgNVBAYTAkpQMQ4wDAYDVQQH\nDAVUb2t5bzEPMA0GA1UECgwGTm9tdXJhMQ8wDQYDVQQLDAZIZWRlcmExETAPBgNV\nBAMMCDAwMDAwMDA0MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAtcrV\nSrX9ZyvZTgdj67mN+pdnyJt6EtjFEu1pkUfxw89hzJqJ4YNep1sUndg1lGnT0pGj\nwSsldoSSztk2Ldf+Q92N0qED86cOP1yj5DClDEquMMBpk2gz81hM940gYkDBQ8Ey\nUayX/H+1RDwwPJOtYdjB/oBevvk2z9OUfKsMEqDy3Z5UOAbySuADdVk5b2qXaf1c\n/Lf8PJIATMHdDHjV9VsELYUAef787ygpqfFpVcf13pYVHtlYG1qdw6j4L8V+eCki\nGUIBPftLgz361G/qR3EMEE/rgiFGjDKlBP5OZ9S6iyMBIMbIOtjyQdmTOLODTYTd\nO+fhmN5agtF9ct/7TFWcypz221bRowJ9thPgFx0rBY47w8Qnac93PvSMVJUx26Xs\n+IBHNQezwwhMcVEjZ6fu6ePEBU39nlV927KQjNoTS7k0rTzXGwb6nkrckrfdmdco\nOehD7EUb5W6TKN3chvypVWaIvDZA4Iyu1IhEkYgQgjwi7MYfdfsXHxzF4X2HAgMB\nAAGjNTAzMA8GA1UdEQQIMAaHBH8AAAEwCwYDVR0PBAQDAgQwMBMGA1UdJQQMMAoG\nCCsGAQUFBwMBMA0GCSqGSIb3DQEBDAUAA4IBgQCIjeDQnFHoO9X4qDjV2LHeVN+n\ndU/8OrGQRI/Hph3+0QJWxB5BMhK+9ZIrij0tUnHBEHywyv7n6PIjaJZKGbtPSxWL\n7qbBlpfP9xByblKz/A52R2j4NhWjW+3YmFYDZtRte57g/eTfvNQ3qiAI405KAZ3S\nLZ8qil+7XRJI2/LxbaOn4ysrmTJri4flkzE0J73hlsSZ8vYEbZY53A0362DfICDx\n+pEBr6WgFoZfCRGyHL90KT45av1URl8FlNZjrxFP9SAncYTwo/Wy58r9zcTyQ0HG\naHY0gpLclnUGYtFAoqkG6MD82uvXcBMqiwLnZ3Q3JmW/CpcUqgPiOTaMUk3kKvTd\n1PBVM7KV7E6FQeM3HfzqWbe4rgYAXaJNhrC5ygB/y+2AWeWeXObsCXwdjqd1souj\nYjwBUPItOGaMPG7tXTYbllG2BkxO/3XVX1qy69RwxWRvtVUdmxZzJPiDNtgG/XeM\n2hkkqin7GBiY0H6IoTeKIpx9V3cJxPJbSUtZgyU=\n-----END CERTIFICATE-----\n",
        "35.236.5.219":
            "-----BEGIN CERTIFICATE-----\nMIIEbzCCAtegAwIBAgIURoa/+Kc2q7MjB8+2EZfn+g/gjfYwDQYJKoZIhvcNAQEM\nBQAwVTELMAkGA1UEBhMCQ0ExETAPBgNVBAcMCE1vbnRyZWFsMQ8wDQYDVQQKDAZH\nb29nbGUxDzANBgNVBAsMBkhlZGVyYTERMA8GA1UEAwwIMDAwMDAwMDUwIBcNMjAw\nNTE1MjE1NDA0WhgPMjI5NDAyMjcyMTU0MDRaMFUxCzAJBgNVBAYTAkNBMREwDwYD\nVQQHDAhNb250cmVhbDEPMA0GA1UECgwGR29vZ2xlMQ8wDQYDVQQLDAZIZWRlcmEx\nETAPBgNVBAMMCDAwMDAwMDA1MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKC\nAYEAoTInAVvmHblkcrCf9ObdWZ5nZsOQugoxSqB6t4VLtBJJkaJGCACwkua5wuuM\nrfUi2PSGYcDmJhuh4G3ThVuRtmxk541IA/mhtrQ2+IIQz1takbZ68fw9u4MGGbHy\nZGrnn2zIcmXL5O93XgnGo7V62539fORtqoZCW2l5+iPo0rqQBP5kiQXqgs7LsPUJ\najVxqjTtJoQZlXh/lRQoDLGwC+gtSfWFoKWRv+NF5PeGhn53UGIqCYy7hjBz8whA\nHzbDx/XVLe+qkgd+JA0OUU/9i7FX9nHj62OwKmKvFfKyrMJI6Zp0h5LW4eTpYlbo\nJf6IT4g1lnb1sh81nbWYbjuhSQAkOKdXuKg6nNkttklu2Jl/S/B06sKzcJFg3SwL\nhICu4XAYYEH0ZUAPHRTdGH+sAxYZz1mLz1HZHeoZPDADtwV9NPLmFI1XXF10ixRh\nRH7/ZS8sbuyb9JUSDnpnaoWji/pnkmSri9NQrzX7DR2xf3E7P+PH5wD7sge0F+oZ\n/2YFAgMBAAGjNTAzMA8GA1UdEQQIMAaHBH8AAAEwCwYDVR0PBAQDAgQwMBMGA1Ud\nJQQMMAoGCCsGAQUFBwMBMA0GCSqGSIb3DQEBDAUAA4IBgQBf3Y8P/rH8B9GRttu0\n6MZ2HAeQvYSRA3A9URkeAhcnTFkuvificrIU/vVni0L8r3flWc4cFQ78qT1IWiLC\nWGooQ0cwkt4By0LrUXYUZ7WliF59pksAcPKR5SJz5V5QEVDRrQmYeHdQXvRV80TA\nfrU+Nk00dHMnBZFAYaNBO0Jqmb05lye4PFJZKZzlfi0HIn6E43HunUO6fXvXD7mb\nHpOFTcDMI9vDG3198zH9/rETMf7s8wrZfBb5Tp9mOg/l8+wWz9PX+IgsLMhacMCy\nnvdhKvdLDzOAqZUB+IQILWDwg2hbVmmDfo1/Vs65sCQD10xse/7phxmfZtLAJQcz\n5z2QxKCM7mFcMGKbP2bEAkkkxjVYGNU1D+yI1W2V0e2zBnwVNPbGUXWEnxdTvI5R\nzkLGsUY9+c7sZvXBmU4Ga+eM75u8p4zfaDF18+3zJ/vfEykB1ZDDUJ7CgALU7B0e\nWGGs4+MqTVviCzlhAJDd8HKWNuwOWxv6UVulZkA2G92V7t4=\n-----END CERTIFICATE-----\n",
        "35.197.192.225": null,
        "35.242.233.154":
            "-----BEGIN CERTIFICATE-----\nMIIEcTCCAtmgAwIBAgIULHodO57xcaHFMSc8XK+EgVidt0swDQYJKoZIhvcNAQEM\nBQAwVjELMAkGA1UEBhMCU0cxEjAQBgNVBAcMCVNpbmdhcG9yZTEPMA0GA1UECgwG\nTWFnYWx1MQ8wDQYDVQQLDAZIZWRlcmExETAPBgNVBAMMCDAwMDAwMDA3MCAXDTIw\nMDUxNTIxNTY0N1oYDzIyOTQwMjI3MjE1NjQ3WjBWMQswCQYDVQQGEwJTRzESMBAG\nA1UEBwwJU2luZ2Fwb3JlMQ8wDQYDVQQKDAZNYWdhbHUxDzANBgNVBAsMBkhlZGVy\nYTERMA8GA1UEAwwIMDAwMDAwMDcwggGiMA0GCSqGSIb3DQEBAQUAA4IBjwAwggGK\nAoIBgQCSR7fLJno2Jc7eProo5lMWy8rOqDqn/6s76ojI8B34M5XPICyKtVvRq65M\nQLtLi0CWgNS4IO2yVYP7QOdobq+GXZCi9xHAO289PfNVlCiQRSelLTzq/vn2Hu0f\nXgdMYBYji+6cd2mKBvkDj05Z+ff9RQ6x9c1PLeyMwezp6pL5ums5lAggZA+zG7fW\nZm3FjAs9ySK2cqwDYrA1xVGGL6FLNrDoFSW/ZVN/o6oBgUYETomErZfBSM651Rn+\nyAQPKaZ5BKdLjUdPI3xXiSDi8pAwnOgnUUIzbMy6dvmcL6Zd+sBJSWylVsbY3cTo\n/2ggH0dNkdd5g7a9wimda69IFlJ0kXhL755LLyhPpfQLYX3eSqYUw83vS1KrIjZg\npsK1BvuL3Ukimy5O+ON66o9qKI4X9GkAG8Qmzx/X4QxRGRcwyvOSHrmpKbpPKnId\nzf3kqIohzCk42tLrBVLzF2+bfZ8PgaPT1ckO3z4rdk3/jm8IAEjQ+YSRIad1X/Cm\nh3nJyUMCAwEAAaM1MDMwDwYDVR0RBAgwBocEfwAAATALBgNVHQ8EBAMCBDAwEwYD\nVR0lBAwwCgYIKwYBBQUHAwEwDQYJKoZIhvcNAQEMBQADggGBAIsZWoqclKlVCWXZ\nEYJfak2bAbzh4iis8wfAJGhBCw+7F+yvRVxFgwh8lWWfkf9OGJmDNGJVtnJgbhsI\nDlQyZpjJERGp3PAOH41DVuVS3WyVkcvxbem6SZYcdAFE14Vm8oxSXb5J6quVZAFw\n2wyAaSiEOj2qnCwP2+u0umRyqiXDcWI148QiXC6gJNHCNkvlC0/Ayfh0bJQ9aA8q\np5o0ZUpWg/ztEUTV+hDF90KdEvyKDLXDSenfY/4OGlMw5WrFviMBAfretjbITbRD\nvWshur0HXqffC83koSTufNt8NZ4nHVz45t5/A1oCS+bbZbDQuL/sazWwZ4FRwSlW\niqpFwNk3DnrDC8PvVtMAVacPBe7FBembFRhx4gb2IjbQZjFx7oQ1bUIHvqA042bD\nPalMdU0QejkxK/HjC4dxC4UGcFF/NvzcZ6hC/bnLNQu9OxMO76GUVx2+CBcqfwRo\nKJOdF0nhbFFbSxwyWyANCZJpzzZV1rnxw/XuCakl0xMLl1EhxQ==\n-----END CERTIFICATE-----\n",
        "35.240.118.96":
            "-----BEGIN CERTIFICATE-----\nMIIEZTCCAs2gAwIBAgIUPnXvur8kqCJyFNlvOEEwuXBwptAwDQYJKoZIhvcNAQEM\nBQAwUDELMAkGA1UEBhMCSU4xDzANBgNVBAcMBk11bWJhaTEMMAoGA1UECgwDRklT\nMQ8wDQYDVQQLDAZIZWRlcmExETAPBgNVBAMMCDAwMDAwMDA4MCAXDTIwMDczMTE4\nMjIxMloYDzIyOTQwNTE1MTgyMjEyWjBQMQswCQYDVQQGEwJJTjEPMA0GA1UEBwwG\nTXVtYmFpMQwwCgYDVQQKDANGSVMxDzANBgNVBAsMBkhlZGVyYTERMA8GA1UEAwwI\nMDAwMDAwMDgwggGiMA0GCSqGSIb3DQEBAQUAA4IBjwAwggGKAoIBgQC4kKxGmTJC\noNMpBNjdGsc9BJomm7tC8d6opb3IgnhzPwwOwC9PAzwdbdGfaYelgSzdbUAxgAeb\nfG22Y3GX4tYpddMC1hjzifwSK8vRe3DJCkl4TGpEw43vWPtjHatVBx1qNlqb9bA4\nYviffZnAFrAxW4sPqX0H0pm+jtHhRPhv25hMOxi5z5bAZdG9dhCMvDaO1OhKhZZH\nqOt9wcM5FDjJMKeEYSQcbSwfNWlvFNqOw4/ZVoijFC6DgSQZVbdIyHz1HzPNkRQc\nEb77N/IIUhgVy7nX6/TahnYJoDQbXS9FtPi9GlHxXDkOeuq0wlJih5mGwsIPDXmb\nExDnUjmLfReJFtn/sA1GUJjKDadbIRgLDzqoEVDOiUr84VRfV76tvim3Jjz9DhNP\nU217KnTRSHQ6fXt7Dll61svpbd15wmhW161qSMm/yLoukn8B2gTzKrQQd829V2oC\nW6+q26god7DjKsVMbYHtdgf7jGcVOyOVjPeU0DAgea5Z9P22IEUk1mMCAwEAAaM1\nMDMwDwYDVR0RBAgwBocEfwAAATALBgNVHQ8EBAMCBDAwEwYDVR0lBAwwCgYIKwYB\nBQUHAwEwDQYJKoZIhvcNAQEMBQADggGBAIxroHjZZ7bimgcH/AN2itj7n6dxcqyv\nSAk4QIBXHvJ/Fk9euhDYGYAxqU8oOvgkiOgD585ocFpF+n6w42MPrb+kKrj9iMEy\nYcQhYRd5d6iWQKImZtouTfQCpaoWFuxBvfGqV6cEWv29OrlPXfpxIyts9455pJe4\nsIjCnRqwBx9vLoMuiTND9inLZukz8t5oR8ggbY9eiNHZNHB4slyDFU40HzczCJ+x\n2WQ3Gf3BNPQSEexOv5FUGP2IYYTpGTh1atwGKF6LRWT/TMxtZPLdd1YyyccZ6v8T\n3Vg6gsB8VG/sVE9US8S3GTi+joThGK7nOkVFzZdVM246h+z5TZTH2c6pfo3AsDEk\nqS4ND0tk0aRK+P+ZUVaOxMzdrUaKdb6W5u54Qu0tUAer3sxVS6gpDRXJ8CSb/v1N\nw+exlGQQeeu9rFdDJCCvxNC1t7w2l8hx8WJfqSiLD39MpwpbnflvgXId/oeQIpSL\nyd7gep4Ibz//pwKd293+hvxyHaAJK9LfvA==\n-----END CERTIFICATE-----\n",
        "35.204.86.32":
            "-----BEGIN CERTIFICATE-----\nMIIEZTCCAs2gAwIBAgIUX8Ft4CMw+n802qVb6gNt3MhGFAcwDQYJKoZIhvcNAQEM\nBQAwUDELMAkGA1UEBhMCVUsxDzANBgNVBAcMBkxvbmRvbjEMMAoGA1UECgwDRExB\nMQ8wDQYDVQQLDAZIZWRlcmExETAPBgNVBAMMCDAwMDAwMDA5MCAXDTIwMDUxNTIx\nNTg1NFoYDzIyOTQwMjI3MjE1ODU0WjBQMQswCQYDVQQGEwJVSzEPMA0GA1UEBwwG\nTG9uZG9uMQwwCgYDVQQKDANETEExDzANBgNVBAsMBkhlZGVyYTERMA8GA1UEAwwI\nMDAwMDAwMDkwggGiMA0GCSqGSIb3DQEBAQUAA4IBjwAwggGKAoIBgQDHwt5WzFml\nipMKQymksGmNJYF3hs4aLMvxS/USlt5IiNmbVb+lvF+syQJLHHTJxBLjUf1MT0Nf\nyMQsM9kBDVD//D0TarCvKyBB/qXqMgmqbBY2j93M06m5jceVJMgTgbsUTS0PYfHc\nVbuyR1HUBqhBXxRAldV6O85KnujiFLmX+QtZ7bhCzPySx60H7u1Q643y+QPYJC9g\nj/wlp2zZ846uI2gtHcUNHHmisIGhPVHUod+w6sgbZRPrvuck8VAutyyP+BBxIR6a\nunyUAyOae7Z0jHMhlcK3hIIlJj6kLcmIXGcLeevYS4DHrgx9/S+pHZb4+0RyhRTV\nG9Yb4xiCvVyOMGpiCE3PnnExnyBZhMZ1tk33pot5IuaL01rPQTOj5/amHCMSnLko\nvWJzkHfVoM2R8ctg5OqN6PKlw8jREMChv/zRhHrIbwTrw0Fav1RvRbnlMZTvc0sz\nxs2Jg9vMJo4SuI98A70qlH+IKLiYG/6VoW0Kry85AD2j6A4G9iB7PL0CAwEAAaM1\nMDMwDwYDVR0RBAgwBocEfwAAATALBgNVHQ8EBAMCBDAwEwYDVR0lBAwwCgYIKwYB\nBQUHAwEwDQYJKoZIhvcNAQEMBQADggGBABb/lYACU8JvXlf5kiCh6yPSQpVG1MCC\nrafKcpyhrGV/IR4BRriWxh1EOpyASae9ykJTPU06nfQBfTf4MdWoeww3GZGzJgSz\nsQ0uMV2d6BDLBJJUarCYW5Q+nd7f1Exs0CyWcXkUdM11OT91E7r2xvTlwA0eDdx9\n3RCCKV0qnfHjdCb7uqDD/N/jtPbGquZua9+cXuB5Ofk7TItPtONTP9nPWNv9gbTc\n1o+VwFIzzzm4taHCXrXHb/yDajJPs1Fg1E6AQ+qqWpwx3rUNrSSI39F7gYbq4eIt\n1gJVP9jBrmVC7tIGGL6hvUiLNYldPZtXx0joc3o7bVOcTHJx4q4lIwjkL4T2sg+u\n+OQ3Ds/KwPGHr/W2fW2l4qdsqyHNGDfjQm+YKtXDmTPLrq8ZxVqHWyJG4x7SK456\ni5lf8Sr0GCXMthGsOlCYqFKc1dLFmPzaf3k23of+5vSAyrZV++IJgCaVeCNPJbyp\nhNtykILcwoO4OMzaqQLQRdfjv2CV3iGsDg==\n-----END CERTIFICATE-----\n",
        "35.234.132.107":
            "-----BEGIN CERTIFICATE-----\nMIIEezCCAuOgAwIBAgIUUY6ehiplyX8Jcm/sm5xFCYSsHS0wDQYJKoZIhvcNAQEM\nBQAwWzELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAkNBMQwwCgYDVQQHDANMb3MxDTAL\nBgNVBAoMBFRhdGExDzANBgNVBAsMBkhlZGVyYTERMA8GA1UEAwwIMDAwMDAwMTAw\nIBcNMjAwNTE1MjIwMTQxWhgPMjI5NDAyMjcyMjAxNDFaMFsxCzAJBgNVBAYTAlVT\nMQswCQYDVQQIDAJDQTEMMAoGA1UEBwwDTG9zMQ0wCwYDVQQKDARUYXRhMQ8wDQYD\nVQQLDAZIZWRlcmExETAPBgNVBAMMCDAwMDAwMDEwMIIBojANBgkqhkiG9w0BAQEF\nAAOCAY8AMIIBigKCAYEAptYzqzTNmFO3ETHw5yP7bD72D75nGu5UJtVDxoBkdwLM\nl+VFsIvmZGlGbDIq0RtQttZKZFZnse3BU4aQ66WNr2WoM1OWnky5zAGDpAcVX4Ce\n8wpFnFCJ1ZrhX+7M7UKr+rHbSDS6FbGRf6bl2hpLdUnUxL+7TRUQ5vElMUtURvbl\nS5CVjglxRtfMLGs8ar6K7v4slPkHLlL7HvmoJB82blzdrS6XJua/DSnIKvWbj7iH\nqyjBWMLcBw5lVNgvKvOmBo63WG4KOhpZMi9r/XoU3vYyctvqGNNJu3u5wKuO210G\nkI2Rb8dHSbRXpbmTLEorXjbW/X+LFdgCwyHlefOUhAu8Dh8nyJVF7Fg/qeSLDTRM\nWRoFqSWQmTm8cB04grMGE0llNznzURVAeJzf5cODyW7+eb0Y5FYPnY0NDyKvSPer\n5xDmIpaPl/7apuH2YRNVKv7pbLgLJHIZdRkYQvMn2efw1pBRuDX9B0bDcepVIFui\n1ZMHf6xep9OcNk+Qt+e/AgMBAAGjNTAzMA8GA1UdEQQIMAaHBH8AAAEwCwYDVR0P\nBAQDAgQwMBMGA1UdJQQMMAoGCCsGAQUFBwMBMA0GCSqGSIb3DQEBDAUAA4IBgQA/\n0dDFLrHsvg7+lzpMFeowSpOKVl+dFpPAkDR8HALEN6zOduO3LGyAzI6XA1ngXADa\nixlVCrzwPPrQ5JBf1Yq0xB98kzp3K1xtcq7zCPP+Yc3vTUR426HA2gIrRXp9HTKg\nA0DPQ7OnguBIc8Bi9Y8TZMUzBmSXIn8ISVsH0d911h7QAgeVxAIb4JjXTOuZtjdy\nN6QZ4z347Z+6h8mb3RGMBNN15EQQcpykO7K87GoR8mGGSZTzstk55utJ6mOMLhVy\ncI+8JCHbiOyEdIo4MIPKLMdnhWBSXtIBH3R9x+WWLGMy6ggmriEciySkMVhXC49E\nZeMyZob2+QfJhormHlD89F2YZfpLlJ0mNOxecj7v6K6UbMosAvvuASgjRXgdYBEH\nqKk+WGcgwMpJzCBHxO4LKNzw5wGqZBpTh57eFghQIcY/gm3Au8rbHUPHuWPKoJUP\ncf2YoX4YxS33LMoKqWITCy1TsRWm0sExBqdpgJBrMfVinXRKPy1voJg6MLWInK8=\n-----END CERTIFICATE-----\n",
        "35.236.2.27":
            "-----BEGIN CERTIFICATE-----\nMIIEhzCCAu+gAwIBAgIUE0cemKdphwCbxMVDfVWl3oggUWYwDQYJKoZIhvcNAQEM\nBQAwYTELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAkRDMRMwEQYDVQQHDApXYXNoaW5n\ndG9uMQwwCgYDVQQKDANJQk0xDzANBgNVBAsMBkhlZGVyYTERMA8GA1UEAwwIMDAw\nMDAwMTEwIBcNMjAwNTE1MjIwMjE2WhgPMjI5NDAyMjcyMjAyMTZaMGExCzAJBgNV\nBAYTAlVTMQswCQYDVQQIDAJEQzETMBEGA1UEBwwKV2FzaGluZ3RvbjEMMAoGA1UE\nCgwDSUJNMQ8wDQYDVQQLDAZIZWRlcmExETAPBgNVBAMMCDAwMDAwMDExMIIBojAN\nBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAl0v9bSqS5LrlDPZJmMzh1/HLpR7H\nJw/iR7u3N6WvMf+xpDSoE7mIewRy3G3eFD3wtlG0Z5llAVQbLNukonErWrhqtBUy\n5qAq2AmolYzoE+qZBcG6Ijq3h8mz7q/+1EV15SOhARNIaEFwNXcXtw54z5rFO5+U\nFAkB1xQK2sQsTVU6xfqpqLMoOpQFqbCcRZPwxGfIxPQJVnfZtnvNr8PuJH76Oldl\nA1qzszfc19BDSRVKUDhBxLyCOkTriYagPfWCsI+5zQw4B6AR+IIWC5kEu+gEy8+q\nPANOn9sYAEgKW2NhgUp0OdpBHGhA5TTsSNRqxV4Hr7cw/FzO1+qkuKS67H20ajcq\nvByEWVk6zMTiEynxpK6OUWSD26rZfIB6oUuGCCLOrtTcNegrLItlvn+cFi5UQus2\nyd15x1QhGu+pLn14/BOx8CSn2u88inYeYy3qkcli9Fqt1faHao8k3/sPza7g8XR3\n7vNvOlGg3cU2jayFkjwa9d7af+pL7r9RJ1gpAgMBAAGjNTAzMA8GA1UdEQQIMAaH\nBH8AAAEwCwYDVR0PBAQDAgQwMBMGA1UdJQQMMAoGCCsGAQUFBwMBMA0GCSqGSIb3\nDQEBDAUAA4IBgQAkZfThO1Goz6r3iwa1qOqbVYuo3XsJ2mRUcZSVbe5cDQbPDbXw\nDSFmkJd78xoYdyWR4D7UHqMzXGY516pFOaXsamNQw9milPU7jFNP5zzIHFBZZOAY\nOeNLhQ56n0eU7hEkv0Msa/x6wTbuFrCXsGlaM8RYuY/cXG1fP3xfoEZUemrCnDm9\nx0ZemZQhxyf7PVv6JNY9oS/RZeapviY7O6wUnYecY3uSScrUPdciKjDAnMpMX8jo\nW+gHn22ZLkVzGmfvGNL+q3HgaSvLQheRWbH+9uIjgcVGKh4xDeG7Dg673e+7v7A2\nv8dZCBm7wjYFAoVcQMd7AMrC6d7haY+PKVIeHxsJJHycBJ6BfuCugBWIzuToLlqk\nMc/qN2ANR8KS8dFJFfKuZ6f6s+dOemzJwvCrG4r2AG6ILP6rZa5qtuaV5+WZv++H\nEfi/Sx3qJWKm2zu2Lfijl2VaUBn9y9pfkuSAscxxO6u0tmqzNvF6cDRWcEaP3/2x\nPKKQFVzFHebOhpo=\n-----END CERTIFICATE-----\n",
        "35.228.11.53":
            "-----BEGIN CERTIFICATE-----\nMIIEbzCCAtegAwIBAgIUMrhQsgcNmNJ0dZjcGu0M7E4XnuEwDQYJKoZIhvcNAQEM\nBQAwVTELMAkGA1UEBhMCREUxDzANBgNVBAcMBkJlcmxpbjERMA8GA1UECgwIRGV1\ndHNjaGUxDzANBgNVBAsMBkhlZGVyYTERMA8GA1UEAwwIMDAwMDAwMTIwIBcNMjAw\nNTE1MjIwMzEwWhgPMjI5NDAyMjcyMjAzMTBaMFUxCzAJBgNVBAYTAkRFMQ8wDQYD\nVQQHDAZCZXJsaW4xETAPBgNVBAoMCERldXRzY2hlMQ8wDQYDVQQLDAZIZWRlcmEx\nETAPBgNVBAMMCDAwMDAwMDEyMIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKC\nAYEAt8Qf2g0S7tEmVJJRlpTnLny/AsVgC6C5zV1cDO6tgoRM1YMJBosI8o8CJtKJ\n/uFoPzJvXox6ElNeHB+c34KQfDQu/6Fw1HWR1ZOVREad14e8HxJxtJ2iSmD4E6+S\nALKJZyV5FA40wC4ZxA9JmIFy8HBSiPsBBvCNL3MTMfQoqeTsJAHopZaKwDYql3wj\nxfO8AN0FG13qbFTDeJBm8DrrDCLl8FeZLLJAtGq+E2J/O93fmMfOp6Sdn8BcMsV1\nML+1uR8uyc+5OZQt3iVBQKo06uiUlnLxJibA0zXFh8PsseKiqyJMiEFeni93hImv\ne7H0NrbHxxVIMZYglLmQQ5rSx8PmXNfNT7Bh1cEsiU9KgQkVCPJ+xh2pQ5eO8faF\nk8QBLVp0RDHiXuvZVHRhagrm+7kCWLSyUpb+ZzXdsI75ErkyUa5zT6sP84n7AGxY\nSofvGrDsOeZJe8PTDPdVB7LG/7J53RrmnzypWOJW1UmS6JKToJrOw5jeOKa113Eh\nhNMZAgMBAAGjNTAzMA8GA1UdEQQIMAaHBH8AAAEwCwYDVR0PBAQDAgQwMBMGA1Ud\nJQQMMAoGCCsGAQUFBwMBMA0GCSqGSIb3DQEBDAUAA4IBgQA9SW7veiuwa60enoiW\npiDtIkcSdeWThUOj0t+zrgfwHfB27PlNpP85t9pwO3oopw5hNvDy6o9DeWZpM5OR\ny67Wb692qllRezmlUnRu+bYLwCHj/8Dld0MjneZYwR8TSHhJLnQcHredwhtt/dVt\nSS10QYlo8FEBTndKdUaBrfLJZqoADKHbivZFPieQ0vypFIBzUcGj3iKr4RLl2dD8\nq6xoJ660EM/93Rjd+AHXkpP8/EJNcGE3eH6OJ9xh0CBf5gbnvSmiFrHtzknzBPHw\nsseWkvAuiaShjIVWIngVZ5JwiBkEVZodCrZyZ6CooJxCFifDVmDc5ZUAvvG025Uz\nxBlhkwPClz7wnMoo6lCEhlzPMkAo8ENeI65gmltQlKmDBZ8nyMQDU/3H/8mHldgj\nLjlCjoQ3A4hONaOv3ztBF4lmokxjv0MjAuJdhpD6qKEYHlhS2ow3GNveNjITTRTf\nEvG1l6XExMMOFFYpJ/IFp73qHgy20yuP5bFx8ggqK2muhlo=\n-----END CERTIFICATE-----\n",
        "34.91.181.183":
            "-----BEGIN CERTIFICATE-----\nMIIE5TCCA02gAwIBAgIUQM5PpChXTaP6MABqfHsx07irUA0wDQYJKoZIhvcNAQEM\nBQAwgY8xCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFy\nZHNvbjEQMA4GA1UECgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQx\nETAPBgNVBAMMCDAwMDAwMDEzMSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRz\nLmNvbTAgFw0yMDExMTExNjI2MDhaGA8yMjk0MDgyNjE2MjYwOFowgY8xCzAJBgNV\nBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFyZHNvbjEQMA4GA1UE\nCgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQxETAPBgNVBAMMCDAw\nMDAwMDEzMSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRzLmNvbTCCAaIwDQYJ\nKoZIhvcNAQEBBQADggGPADCCAYoCggGBANjKHhokG5vxe0uReDxJUfQ/Sakq9SJ/\n6Wr3rUj9xrl9rQFyAnA026DdRm2LrmugfmM+muUK6VuSkTnXErHSthsq5OWy/ikt\nBB/EqGchb0tmJ2/0HYYG1igpaMewqFeLh5dJJGuaQ8Iq0vywreKY92p1owIvWJt9\nAkmfVG7dVZDoTS755D9ufOIwICPouzRkfmLg9KvF/yJyA0pkPyKUAHP1O4T0ylva\nIBnf87K3yitebg5Y8ZYD+XLwIPHZHyyddbeVqqoZ5a7JDZ0zevUtikC4ZAyVtfuv\n/RajoSVH6q9k4TLqDNclWa1A+OAc6igouGZPXAbkFb3KachBum3VSOt9eWJd/l62\nHz/oIbAuwCCyVYnnaPZMk/H4mVIR4fK3SnBigixcG/fpOg42FQOewZ99ZgNk25Cd\naR/KhsIt4pfXBn3B244tkw6lnv1m5WA4wzrf91s869YVF709fWFxGdQ8gzjm/N/2\nPxhUKP9SQpSaa+Ynxs7IlIqwMMeeHDp5FQIDAQABozUwMzAPBgNVHREECDAGhwR/\nAAABMAsGA1UdDwQEAwIEMDATBgNVHSUEDDAKBggrBgEFBQcDATANBgkqhkiG9w0B\nAQwFAAOCAYEAkHhaWgdX1ILaBNI+HtQs+VT8syFw3quk405dX0xEcc4jwMtWIQ7z\nXGWxNu0aIpb6nLaXN05Klr5M/d6n76HPeLql03GQyzneYmQI4tJHsZy0H2sWuIEB\nJUx5f1daAYo27keSffKxLVi3lOF0VEZcc28/4HkNvqNPRwe0sf98ihlRYeR1l4oq\n5z9Ry70U3P8gv1qNQkdUtIcSZ6EXpsUPCQJq1Wl3sm9DFCmO8AkYp14wu/AX5Zv9\nnnKWOqcdkfQQ3bZwxetXvpWJi/FeEbVUekV5GUJthGCKrDNbJokMWrtmcEe8MpUI\nqWf/FOlAOH8BK14RQKmtLdUnO2/JaZ+08MPrTpdDOvpmSzbQ3AQDpvo0YQFXvOSw\nDSSLYRXH43M/fJYdOLNkst1XP3EBtEcmHgacDX3WVnjAE73I/5iH3yc9CVE1tGTB\nitt9SferxJwRTR7U/ecFKUUcqVmmZasiTxDk0bvI1KwM6WUgvbgMqU3m9s1SBJBr\nuFGDdKepdNFA\n-----END CERTIFICATE-----\n",
        "34.86.212.247":
            "-----BEGIN CERTIFICATE-----\nMIIE5TCCA02gAwIBAgIULbke/966LiM2q2lQLvYMXGJotaUwDQYJKoZIhvcNAQEM\nBQAwgY8xCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFy\nZHNvbjEQMA4GA1UECgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQx\nETAPBgNVBAMMCDAwMDAwMDE0MSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRz\nLmNvbTAgFw0yMDEyMDgxODAyNThaGA8yMjk0MDkyMjE4MDI1OFowgY8xCzAJBgNV\nBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFyZHNvbjEQMA4GA1UE\nCgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQxETAPBgNVBAMMCDAw\nMDAwMDE0MSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRzLmNvbTCCAaIwDQYJ\nKoZIhvcNAQEBBQADggGPADCCAYoCggGBAMMzie9nBvMeAXIyjSx1ATyqyPUU88LK\nfU1PRsm7atnkHd6uXxgAKl4Q7dnUiFYl8iM37gGDkkKVqtztKfwjURiwHh2KM3AD\nLbWTG8Q2Nnxx/Kvy6GQkE4GASfMdsFHOZ5AQQuf1Ep4Cp2xDht6HWBzEkgRryjvY\nA60cms11hsUQPk+6peguOUlitrAFmBHhZw1TsKaAVtGU9AN5ddF3K0VxUuTefo0g\ndX/u+jPCz6ctAO5es2sKTjKyyayO/V1k2MIlEf1Vsn/mooMCGHHF+C4y1+5dMXO7\nrrmt9xCHtd7xzl5PteFEekRIZ9KqKlk7ZLr3oJ7GGZ4UwRhxf8tmVMJIrfe9Gf+9\nagOM06giLZlaipDB8Jyk+4t1hIr8hkumRSgO6WbLnXuhGNgwgxH+CaDML6Ve+xDi\nknwVZ3WuzFHvHdc6X7fxpnoxeTBQ7ePLVJKhyr8AUVm6mVF7ANhqz1xxsUZykUCG\nMqPliYufKuN6aLWTUIdcbzej0Nv1HKJvdwIDAQABozUwMzAPBgNVHREECDAGhwR/\nAAABMAsGA1UdDwQEAwIEMDATBgNVHSUEDDAKBggrBgEFBQcDATANBgkqhkiG9w0B\nAQwFAAOCAYEAJVMHvDq8+Oxsb7npMXjatwOz+6EflvU8iwQZR8zgQcoH1ckGthN1\n1vVExmDWwRASkTuNLg3rDZp+DAzYKneb7QQh73SBZ4gvNwo+Zpo7KCRYkXU/XiBN\nq9cqN5bzRLXVIbiI8TaSjFXMbvzkDwSE4z74Vrisex2dnraRHhb/P6nIzpCK7AeK\nqwph566vj5pG6YMdIuNi4D32xa1nXr13Xs80e0B+4/i7r4qckCgc4F507gsXbCZn\n4DL14f0bv1ENY7Jy8BSvmichTAZMxtxomMpzppePEuCWkgkCT661e36Gl3p7piig\nIgotBED3ruVtwbuUFoHKUt+u7lesoZJtZlG06aResSC1UrszAzpyymxk9vLu4cHh\n/ysOHnzPOLkuHzYn1PqwdRQwLw86qN6D5A0H9auKF/mml26FiYf1SdvQ4Cn/EHHS\noOCa4R4cyF/VJnD0ROROq9UFnCIIndIDlTG59jG6HqCgJOe4ULj/ikZHm1EBcgFe\npzaQQk2bSl8g\n-----END CERTIFICATE-----\n",
        "172.105.247.67": null,
        "34.89.87.138":
            "-----BEGIN CERTIFICATE-----\nMIIEkTCCAvmgAwIBAgIUDNF764/p9fzc39VlNLso2PYReUkwDQYJKoZIhvcNAQEM\nBQAwZjELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAlRYMRMwEQYDVQQHDApSaWNoYXJk\nc29uMRAwDgYDVQQKDAdNYWlubmV0MRAwDgYDVQQLDAdNYWlubmV0MREwDwYDVQQD\nDAgwMDAwMDAxNjAgFw0yMTAzMTExOTAxNDRaGA8yMjk0MTIyNDE5MDE0NFowZjEL\nMAkGA1UEBhMCVVMxCzAJBgNVBAgMAlRYMRMwEQYDVQQHDApSaWNoYXJkc29uMRAw\nDgYDVQQKDAdNYWlubmV0MRAwDgYDVQQLDAdNYWlubmV0MREwDwYDVQQDDAgwMDAw\nMDAxNjCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAMXdKW6w2QKcZb1c\n2ajhUhG6O7x6m2XMkBnrkX+m0h/SA2NnbPLy6Ruq+lzVlEQNtn6GfQkhR0J+3L70\nXlggfDqLgOyTTcVjt4YDDAdW+h8KcqJUYFEuwr/pXg4Qn+hGLD0evxKSedMvTHrZ\nkeXiB00RCTSBHdpOVw/s7s+3upvHnY25h8KEur7ZBzIRsxxZ4fBIAkc5gOv78Tlc\ns5/c49ak0rLFWx27Pi9+zfV91cc4Ogy5/MW2l2Soaa1xp1HVOnPEy9LGpx370IX3\nmIW0VHY68vySAQ1vkfr6f5h4qzTyH5A/LOqPFyOaOjvxd28J5S5c44luiciSF5Ns\nENBOCu1pn+Gg1YzPq1QWL9p8TDjB2P5v2la2VnhKNXJjeY9rG38ZOR1/sxCzrkq4\n+d8YYdX+FZc5Y0BtKRLIIFbHHXJLWAe+j/Nak6gk1kkE/fWlJe/V3XD9NWLsoK4W\nf2pVGMShOCW34HUaN3R94WQ6Yj//efwXR87mASUNhiWCidx1XQIDAQABozUwMzAP\nBgNVHREECDAGhwR/AAABMAsGA1UdDwQEAwIEMDATBgNVHSUEDDAKBggrBgEFBQcD\nATANBgkqhkiG9w0BAQwFAAOCAYEAk5szB2s60ZVJTnF5eSPH54mvAnf0VGzSIhFp\n/6Ifiwnb/Ar7Ort0vdcufdN//rVNHuC18oCIqHRSP87/wfYF35ggPepZZfeXabLN\nui0oQrOIHMy5T9XvJA8GFBb3uds8YgeIqft6/e6kKOXPtLhDYPlLojTVLgZHNPQA\n2JQdsuSl93NeDeR775dIOMPSdhZ5EQqTgKJDTR8L4ujVlUS2Uyu8VdRiFD2P2ZRv\nlk3O/b2BQ0ssJ2UAvYUGSsRRZv1yCEmU5ri975DP2qTGCWkW/2LrDpVVcS7ErG8W\n7yWqJXl3XDQTHEzHTjAmobCx6Yaa/j0KJwzMKL9YBYCF1V7Nh1EyNU2y/hDeGfbq\n9KNOabmqhTdWgGONXbE061ZA3A9xqBKchgJPj0rhmRTTJ8BANpst68rY+jqxTuZ8\n7al+MEFDKBrdVA7xDtmz+DxwXqyZYn1K1279RITNLSQojA/TZocgAPOMqXPQlGG4\nUsd9Lq6RK8fi2Y9KqMgWpCvQBs4g\n-----END CERTIFICATE-----\n",
        "34.82.78.255":
            "-----BEGIN CERTIFICATE-----\nMIIEkTCCAvmgAwIBAgIUBO1Y5x8lupZAm4FAwnbPgHVJ4xgwDQYJKoZIhvcNAQEM\nBQAwZjELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAlRYMRMwEQYDVQQHDApSaWNoYXJk\nc29uMRAwDgYDVQQKDAdNYWlubmV0MRAwDgYDVQQLDAdNYWlubmV0MREwDwYDVQQD\nDAgwMDAwMDAxNjAgFw0yMTAzMTExOTAxNDRaGA8yMjk0MTIyNDE5MDE0NFowZjEL\nMAkGA1UEBhMCVVMxCzAJBgNVBAgMAlRYMRMwEQYDVQQHDApSaWNoYXJkc29uMRAw\nDgYDVQQKDAdNYWlubmV0MRAwDgYDVQQLDAdNYWlubmV0MREwDwYDVQQDDAgwMDAw\nMDAxNjCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBALvBkwfAkcDliDrv\nAQBXDdZN0UIIrGaZXMKddcSCYV9RRIrfvwcQSnarcWsBWhR5QP2sFUlSakr1shig\ncBDSY7qXCV/VzDBgNDtH8/rOIzcB38mWrnE9ZJWzJwk3tfLThYQIj9f8iF4k8HLU\nutLxGdORui5oF2pzgM3aiIiwnkH/1loJdyCCkXj/nO+PUrMPhcRBCCQcc8uxsQOb\nIctCwvF7R7KW8JdkV3s9UgUsIZ7EfZfXIPxV/Tbye/Z5+W/4XtA0GEouCWY2ZCz9\nFfPNm3JRtXplQJS28dCfFe0EdxXyP+EJ46qTfH88a/wBDI7hum/DGyv0EXnLPDMe\nCW6HTYfmmzs+ZLWRCEFKTTO5FnslkNXHn7FDLN/SNWINN9U9IiJgbd4LF7Cy3AUm\nTmGD9ZNHBtUaFsgy5C1x57Bk2abVXlK2Zj5RNZEE6vz8l6Wyq8CcvYEbgWFwxU9r\n0w6AGvBfzjREFZmzhT35UW0c5vWW1vdyjWtuvouI23mwhKL3yQIDAQABozUwMzAP\nBgNVHREECDAGhwR/AAABMAsGA1UdDwQEAwIEMDATBgNVHSUEDDAKBggrBgEFBQcD\nATANBgkqhkiG9w0BAQwFAAOCAYEAXKIyvHZHnpARNcjOmVF0+VGAbcoJgCAmc7yv\nUXwGfAt/1hEOry7Ajh+ZaWgeFXEcBz9suuiBnclfb4qytl9EPAZpZ6o0RYa1pT53\ngDVgMnWDmNyB6wE2mcBWGfXCaCb37LEvcTZl9VkAgTu/0t8xvT2b00xu+kca0fd6\nlqkIApwg3ct4FtfPCo9QbR22YAaNbvYSyo2vHitPPnd13Umd5JNljwXzOhtMr384\ntg11J3Dw6OzCG+SSNwqip9XenoaSBa2lOvSuSQ9SxwiR8TGRf92qrsPzdsweq4Rr\nEl3iq7Z0B4kWV7Gjp3m7MnBpcGyydf2IHW2m56ia8xGM7y95VOvplfHIzEbqA0oi\nibo7awb47ApFFLIVNtfW4kZLrq4SyKYuvUUOpbdoSoeR//zESmlvlsCh+LqrgN7g\n8FKBBYkAYqnLUqDyFhB9Dnidwbxy+C6mOUg12/aeq+FzSLPq8rgbaY8/NPyeCOg8\ncVsKLqoUSuW0nnD2LtDjSsZ445xq\n-----END CERTIFICATE-----\n",
    },

    TESTNET: {
        "0.testnet.hedera.com":
            "-----BEGIN CERTIFICATE-----\nMIIE5TCCA02gAwIBAgIUFTt/PHfHVCRde4wwkTbqX5fvaLswDQYJKoZIhvcNAQEM\nBQAwgY8xCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFy\nZHNvbjEQMA4GA1UECgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQx\nETAPBgNVBAMMCDAwMDAwMDAwMSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRz\nLmNvbTAgFw0yMDA0MjAyMDIxMDJaGA8yMjk0MDIwMjIwMjEwMlowgY8xCzAJBgNV\nBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFyZHNvbjEQMA4GA1UE\nCgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQxETAPBgNVBAMMCDAw\nMDAwMDAwMSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRzLmNvbTCCAaIwDQYJ\nKoZIhvcNAQEBBQADggGPADCCAYoCggGBAOXnle5S3POX/vIIQLvqR20kfZ6hYI5s\n5Kcibb8dEP8TgrcvPKoB4glquxVZxCw8C1pEQ5uLjRmmK8cEE/HNnXsr71CDmZoI\nv3cWCrF1MkehLQIF+KMdqfgf9PIUv7pmgKcc5hTlPEResdUejEIC0cMjhFrAfZq5\nZ1Wzeci5PMpo6op/QhpoOPwPl0k4Ljm8pxKeIAj6edsm+LP50vnMo8v5GWc7k7tI\nQiI3bO+P/H0bN4j4t/OS0scG9bG/SnrsQv4MBnUr+zwpaaCKvRUF53klSE6N6ZVH\nBBVB+cLWpXO45loXMzuCLm1fTZxxwx04eRBAUylnNEXF+As1eqvZrPt1UCD1UpKi\n+VvkkZlPDu9iUAI31/NaoXym0Gz4LIbpXG7NR017V82TRxQi6Q4WGJhqWek0Ytm+\nwZn00CIb/V8ZRyojxdlIAlXXWVOU3LzrbuK9QOTdwN1dt3IVEdZ6EV73z75GrL2W\nxBTQZdwd/BM6jOJuvVWbEBObZ33G7kcKfwIDAQABozUwMzAPBgNVHREECDAGhwR/\nAAABMAsGA1UdDwQEAwIEMDATBgNVHSUEDDAKBggrBgEFBQcDATANBgkqhkiG9w0B\nAQwFAAOCAYEA3PLAymODqCJ7Q8NnTB3De9onQV7h+9Q2TByIoeOiKwhKvX3R6LTy\ncwChTAOyaS7hH5i6JXOzgQac0g7teFKH4LPemTfRuUH7p0CmbaJe2oZOWjxjI3aZ\nSBRhDi2qz9ehGZBHxqtNhezm5cbxHBW3fm80FSeIDM/mt028Y5Vb2j/Y+7j/BwY4\n4qHL5wAS2qb8qM2Ki5c0DVdJBszl9QeiLYk1RgrIC0gMLTAs7KO7TGDUbgAsskb4\neSLvnSgA761irNgtl5p4VzZR51ft7icRYGShG+GPMV+ZvFtRGiamzYHZeDt3Ehky\noqW+217QVgelnZ8sI+BZAP0RWnQwKN4St8rPLjppvXTDE4Vz0C21WSYqtsz/hasV\niIu+WMhb0fwdjvWDe5Y48MLWWkxsHcjI7WW6ZVgtSsL7j1Wbb4QIZBMEK66K0QFc\nMpy/h47JAuZeAyMa66ArFfCAa6QwLMqLTeeNS4NWRFwDstSFmUiuizap8QQvafXa\njMbYW4ufxHA6\n-----END CERTIFICATE-----\n",
        "1.testnet.hedera.com":
            "-----BEGIN CERTIFICATE-----\nMIIE5TCCA02gAwIBAgIUWfugAeiP2tqMFfT06m3oj6oQejMwDQYJKoZIhvcNAQEM\nBQAwgY8xCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFy\nZHNvbjEQMA4GA1UECgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQx\nETAPBgNVBAMMCDAwMDAwMDAxMSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRz\nLmNvbTAgFw0yMDA0MjAyMDIxNTVaGA8yMjk0MDIwMjIwMjE1NVowgY8xCzAJBgNV\nBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFyZHNvbjEQMA4GA1UE\nCgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQxETAPBgNVBAMMCDAw\nMDAwMDAxMSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRzLmNvbTCCAaIwDQYJ\nKoZIhvcNAQEBBQADggGPADCCAYoCggGBAMDap6U1fzQlnfOrpuqfKGtYMkGeruLl\nqrV9ExpgP/BLQcdrYnlXEeGGolQ9w7XtzrwUEDerIoI44B1ipVFpS9iHrnxya617\nFPYZ2Bn2wHRv2sZSTaNGvFCD1aigFZwm9D3dlgM62Onoj4hrKH6wS8PLUxKn/ZQc\nYjzS+8YhXctZ50FJfO3tms5vTrv7oanDyGV/qmTFGU+FJqrAGKzrW6/wM60fAF09\nHBBVUQl8D8d5BVf/KeZCeRZCpAa6VqlfsEn9/Bg6aXIHTW7jQWMFv+rv3qmfe0Io\n8iIgTeSADDC0x0rEGcYSUttEzFyXNqnqjjXWA2tj4G5jv6SzE9yaVUMnuUmQqjOD\nyd19SnJRNlARaP81cYO0Ge0JLKGLbtWIhDnaKG0s16WoiH2AGfr4IuRR+Z7TJnsS\nYT456jOdUcg8FJMkQqTyChR9sFkpIjuqQRdUkG3btTwqjN8itmV4yC5/sJr7OXYS\n/g4oP6zcfHgkLW4c86f2sD/mt1I7KEcVZwIDAQABozUwMzAPBgNVHREECDAGhwR/\nAAABMAsGA1UdDwQEAwIEMDATBgNVHSUEDDAKBggrBgEFBQcDATANBgkqhkiG9w0B\nAQwFAAOCAYEAvphBt0pR5hiDNTVqOR2uspNVu8gYaWOQI2n74eaXyovrLastfG9m\n7mORS5iykIShbysXzjojdKGqLTIgjjV5QnPs0HrPmk4Z853SxedXASiVqGiRmhqf\n1iGNVTrL9Qc/HhEvu5O/OHHzC60LkEmycXdVZvO4ThdGHVaGmbEPX1+x+M2MbCCF\nVyT3byQsAwN2o1vsd8xAaxgVEWtIw5JOIm5bBYDA3jGlUGnZuGVuCrhHI+Fr1Dgo\nnr162S0ZKguRxriL+psLQRkB0fg4j4J+2Gzq89tt/4RrW0snAU9Isk4QOsLR8kYR\n/wleP9/WMPNp0QNUEB0gm5/SPcJmzt1kK0IIRkzMB1q6JCC55VCBYYgnuryX2fE5\nduWhavN/owRqOFfbXpOneV+hAI4YIsM5tPlStjurTAnetPlcwKeGf0WPOeRXnYLg\n4Fe/UjNsWMjeA08CJxsgxeR94890SHBBbv6I/Dn4Jc9+rbUqUMJeMoTKakjeY5C7\n3OfLJFR0kaGh\n-----END CERTIFICATE-----\n",
        "2.testnet.hedera.com":
            "-----BEGIN CERTIFICATE-----\nMIIE5TCCA02gAwIBAgIUUFiLfdHDEUaADGZBaLFe9h968P8wDQYJKoZIhvcNAQEM\nBQAwgY8xCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFy\nZHNvbjEQMA4GA1UECgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQx\nETAPBgNVBAMMCDAwMDAwMDAyMSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRz\nLmNvbTAgFw0yMDA0MjAyMDIyMjVaGA8yMjk0MDIwMjIwMjIyNVowgY8xCzAJBgNV\nBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFyZHNvbjEQMA4GA1UE\nCgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQxETAPBgNVBAMMCDAw\nMDAwMDAyMSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRzLmNvbTCCAaIwDQYJ\nKoZIhvcNAQEBBQADggGPADCCAYoCggGBANIbbWF0ovxRGgUtcsS5oeC5f5QaePeh\nOKEySz2KAnbppb1hojcisuvA/WRTHoPRGTLGmsLdppAAC/DFtr5b2JyjQT8XgphO\nmAL9USsWD9FOL6NHOT+oicQyS5b/GEMjKnCG0jENcdGWqateFC2642TkITOMbzYq\nEQ+RsQAVsSLwUNYC/HHsokf7Aw7ozfR7yw4WePV8ubUnnD/UL3GiJD52uQXDblzX\nCgHIeUmAv4vFq72tbFWUHQhuQxOWJchlJ20LnpLZq0A3/jR++NcLdHfVJPyMqnSR\nTn9Vjx4H0Evfj9E7uL0Nomc3bIUYoCwGsE1eK22ipoAG0uAzihR/RcDjWzkPxREN\nkrJ/PTh17XujlQ7YUBmvzA7H5MdpqTdlFodSDNkMImT/IqksuQ4Zq1U9bCFhyVj+\nWy1K9nGa6ZggLFBfIm3teby9Fd6vqbhiYjg+LzuW90avHZPfWwcZA8vHB2Je2ykJ\n8lkmpzlhE0Y0nDD0Yyx6PwruZxlhJYo23wIDAQABozUwMzAPBgNVHREECDAGhwR/\nAAABMAsGA1UdDwQEAwIEMDATBgNVHSUEDDAKBggrBgEFBQcDATANBgkqhkiG9w0B\nAQwFAAOCAYEAFtmjiwDAa4MVUikE+10Z9DZXm629QHomcPI7m39bS6GcvV3jBgpb\nik+RfX8WIK5uekqPHCx2pfN+kDq10YHRNhmToGt3oMHYDJS3HgK+Y4dw4djzR8jy\n5i56sLBblprRpiE6PzLVRCc4jqpN5tHpb5CGZamwMHUJb7oYkWLKfG0v6laqYFhu\nWDLqOp81BGHa/wWQrsb6pRWy+dqoXBL+ENNyZiwfk5WBAWizGnBX2j/tsOVeY1Io\n3ci9Mn4+2GuwdCP1ZaqltgO1hf0SO4lq0qsWhUxo1fILhjKjtnZJrsDTpUnREfuW\nAHjSzCktwSXYO08UTYvR6SsvhwhhyvjzfBbz1zYWkr9SOlFN5VjDF8lAEniFYV1Q\npNVwDXHsQkToTynmGMw/v7kPooRo/968A3MTpUuqrfWicA2/N4Ci8veG8bHhfwSY\nVI5m1QCehopykW8pQCReYWT1L+ZVgvP51T+ns0wd2PAOUXTCroAUxowFrkKmVIsK\n5SoMJm6zbLDh\n-----END CERTIFICATE-----\n",
        "3.testnet.hedera.com":
            "-----BEGIN CERTIFICATE-----\nMIIE5TCCA02gAwIBAgIUf+JnUbUJ9EUSCt44+5wcBQf1vLUwDQYJKoZIhvcNAQEM\nBQAwgY8xCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFy\nZHNvbjEQMA4GA1UECgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQx\nETAPBgNVBAMMCDAwMDAwMDAzMSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRz\nLmNvbTAgFw0yMDA0MjAyMDIzMTJaGA8yMjk0MDIwMjIwMjMxMlowgY8xCzAJBgNV\nBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFyZHNvbjEQMA4GA1UE\nCgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQxETAPBgNVBAMMCDAw\nMDAwMDAzMSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRzLmNvbTCCAaIwDQYJ\nKoZIhvcNAQEBBQADggGPADCCAYoCggGBAOg9cSyn25VCL1jK4mLvSrzfxzcYq0aD\nYn/GTY6C7r9NPbkMt6D3tip5Dgi513WRfBVR/BoVTnZdicf0LwRdmWdj6JseU13D\nezXb0CMBRnQRXC5QgFuTOtXZHs/YriHsBTBmnFpkMevw+4y3zd+cs22Vt4zUwDc0\nxOdjzRZap3WKuLLxacoXlHOXQzzI7pa9FYuMRFym4fHTJUx6BT4wmfG1o03tA85g\nZWnPPhByh8G5p/BErJSg/c4PEsLb3oo3nl2QMfHsvMNbZp8o0MPEXIg8onW2Cuz5\nakq8gv3UcoZsx09BNxdTLhQgSQUBVPNEGZdyetdxq+79ijvQsCt+OBnvxwWR6P8B\nj7RYHMUcV4QkZTfEsF/92td46h/Z8aw3JCqWVt/OkK7SRAGrmGygNgbyH6BoXkLg\nE6XLCFY0EeLfvBUXZ+yf4VaYSsEOb7dckFhcTl01yd1v7u4wkR+LHwOeeM8NFG7M\nCrjBbhZZHzAZ96pVROGRk3hmxJ+JCrYnOwIDAQABozUwMzAPBgNVHREECDAGhwR/\nAAABMAsGA1UdDwQEAwIEMDATBgNVHSUEDDAKBggrBgEFBQcDATANBgkqhkiG9w0B\nAQwFAAOCAYEAWU7Pz4b01bBqNehGDmt2lsuXLvzvk/yImVF/D8KFgYri/j3HLvDB\nrW2UW3lTPlP+dqgOc07cRxXwk3Ax8i6k9DBFLbFbIBdygXeeHV1Z7vxBtYyEy5KE\nGpHwM9f67Bx+p+l2UIVnqemAlyyr3Ip+1WI16nAriPgUdJG6Lav8LiJobqKAoJS4\n1dXMMzwwuhW+G84Z0nx4V3gvM0by8dGXK25jvzI1KagSPCg3j2LXL5bjsFRntme7\nzyE7blKeg5l3IuhMzQ1bfCLk4viwP2V5QUC/NCifOAi5isqwsu/KAwzlofrcSFVb\n3e+3NT9p4K6/PfzvtbuZCB3H1XSi3ZPc2LAKgFHBaX9zLutAYTMx3LmtJxvCT0sD\n3w7P/Uvftp8LWl4zlTSR9JihMD1GicG4jej/cbAFrjsKm4oknJqyJ03HL4DbyBOl\nMCMU8ESuqWgQ4YVE2C9BNk9dSgxjyhbiUPPvpaAoBHRjZH5RXfV5P4Uoa3Dqlg2U\nBFwHaSbyw5sv\n-----END CERTIFICATE-----\n",
        "4.testnet.hedera.com":
            "-----BEGIN CERTIFICATE-----\nMIIE5TCCA02gAwIBAgIUOELVS29dlxlF7zBArXjBv96kZVIwDQYJKoZIhvcNAQEM\nBQAwgY8xCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFy\nZHNvbjEQMA4GA1UECgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQx\nETAPBgNVBAMMCDAwMDAwMDA0MSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRz\nLmNvbTAgFw0yMDExMTAyMTM1MzlaGA8yMjk0MDgyNTIxMzUzOVowgY8xCzAJBgNV\nBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFyZHNvbjEQMA4GA1UE\nCgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQxETAPBgNVBAMMCDAw\nMDAwMDA0MSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRzLmNvbTCCAaIwDQYJ\nKoZIhvcNAQEBBQADggGPADCCAYoCggGBALTQ71yt8kzTXsueZIGZC9h9zJGiA0QD\n60ghQyNpqUv4Ay8QX4lA8f9lNwNOte2KEiQnlvKBQkwhyrjxlyILlTs751HoxpBy\nlW0sxYKKTPwmA365zB0pu1KN1hj8oS2HLWPLd/ZA9+RqksPYRe9TUw4+taTjHKUG\nJP36XRN6A2hLrl7CGEutkoI8QyVgtsk3M6PM610/ufEDsf46I+teQ2k1xqiQVhKG\nd7KYE3GuxkZN+Qh6mXynUAl6KCSOX7oQXNvLtXPdR0B0NqoVY53xpcNGHFSMZO/n\nYootrZKXtJ7m/xuGGCsOh0stDHX9dyGwoF3jFHzFZhN48APDJCiUZai8O8QQfqjn\nYeis1bnXrZtAhvLnA3bTB/EJ2SLZfK3OKRUFe8yXlkVw7H90nDSMMcIsuSqotxjN\nL8eCFKYdJMRUCpzKmiat0bbcKKKwxT4G6IBJqHy74wXeG9PQUrqSHclle22yG8XF\nnqAVz0/8S2LGFH3DaOFGSVntpZoaTKsUFQIDAQABozUwMzAPBgNVHREECDAGhwR/\nAAABMAsGA1UdDwQEAwIEMDATBgNVHSUEDDAKBggrBgEFBQcDATANBgkqhkiG9w0B\nAQwFAAOCAYEAQ1bJhP4LT6yeNHJMe8NPVIYSVMkEroZ+DKMG0qRuXY5N9k9JgLaw\nLgTsg4EhkhuDde1iKK2MmFWTIumcenXjnfPPWD8KOB8JEJPqjDbYKx5a6fOqmOXD\nSWobqQRfS6tW5bX7Y2pYefY7PXxdJclSKgLu2wAZUxdnlqbvl9CMxemmg4tBcqxM\nDtuMa0X3ad2G4k425h2x9cqZCthvwodFpMQhNF6u05jM+XPk8nliCOpNJGAe94J2\nACoNZxUeu4jw9Bd/2yUW77u9VbFDprjROyr6GAt/05oh0LHGSZY25WRNqNKhnaj2\nD+9sUiiCEBfvUF/i5QcyFIi9O+uThhoDMvW4YzyEyq920jKMeDBKHYaUjIs8H6yC\ncqfm+bdasiMrruODgHL3/obs4e+xEOcHrMIR/PFF6nAyHl+zSTd4PrgLq6PHbJbe\nsyESwaH7NQOfrfuvLxwZ68R9vNH0DrycrFVpPOo9ZGdNHu8+Gr279ryrDD8zUMIK\n3GhM3jOXmfOR\n-----END CERTIFICATE-----\n",
    },

    PREVIEWNET: {
        "0.previewnet.hedera.com":
            "-----BEGIN CERTIFICATE-----\nMIIE5TCCA02gAwIBAgIUJRqND9Y1iOsCwUR0EzLM/cJo/RAwDQYJKoZIhvcNAQEM\nBQAwgY8xCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFy\nZHNvbjEQMA4GA1UECgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQx\nETAPBgNVBAMMCDAwMDAwMDAwMSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRz\nLmNvbTAgFw0yMDA1MTMwMDMwMDhaGA8yMjk0MDIyNTAwMzAwOFowgY8xCzAJBgNV\nBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFyZHNvbjEQMA4GA1UE\nCgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQxETAPBgNVBAMMCDAw\nMDAwMDAwMSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRzLmNvbTCCAaIwDQYJ\nKoZIhvcNAQEBBQADggGPADCCAYoCggGBALFBcrZEcpvVKt49zOKE7K48ujZj9mGr\nr42OnVXMh5yIAmIn236kTDjrIII2tEJBmESatgl6AKdQpg05DyndJl20wdAJdWR+\nt4HlUZzkE8Myhg1FkwbkfHbcBQhyR0/W84NrqsulXgIZhXoU9uysQiWLOGC1ers2\n8+UhxKH0MNPBIOsL/v0//vQXU3r2yobQbSSzf5rZ87Q5zaJ1Svht2MjSORouuTqz\nA5kHTR10x/lwNI5JTXw8MoDkjpfSfgc9qEICcDYFAAjtlHqVyLuvMlTLer20a+3v\nzkJlLUCauIDaXPZQcO2909RoJzeTYsunSmVdJM8LeTSN0186hNxJ1urhFTpi9VMf\nR2q79abVxrodRrtkoGb5omCVhBxRUxZWD6uKrRiZ1R2mWXQjQ1hr3+rR/nq7ZwqU\nJbbHd7ySUbDLShj9N3q850TppARY8rkgQyYR5G1nLhccnFkc/M3XLJQ4D2Cw6Ffo\naWQPQDdOQnQJx46PpUiGxrlw2FdCeRVpRwIDAQABozUwMzAPBgNVHREECDAGhwR/\nAAABMAsGA1UdDwQEAwIEMDATBgNVHSUEDDAKBggrBgEFBQcDATANBgkqhkiG9w0B\nAQwFAAOCAYEAcXdekGixsTWHZGUjTPWJgBhNPO+P87zqSA24wWtJxPiMpJBASVlT\nCKHU+2YDBGPtSUy0ag+7beeKd85zofkRGk8Ts2x5vHRX556dOLCo49POOY4Ao1rY\n5Plt8dmU2glyxF9VyvCXUVWACcbKRlCd4Fl7Wckmucf4SuablgYd47Wa5pvBlWI5\nx6ZNl/5L1a30mQ+TYxu6wfBgz+BY8siE/UAXaIT3DQmlNaw/d0A4fu0c6tVpeVV+\nL4p6vNVxqLvewf4I0jx0WxVlW3kB+pS85hlNqyiMxlg7VNT9SqV85zcd/JstWNqB\np0xVv1X8eMGVzabu8kRuDHoBRc1G41kXTbiWMomcROsKWSx4LqlVqcDT5CRXurWj\nTlBH5ynX8QGJ0qzVppJS8VQ4V6eduxQwAR1KbjRmjazoGwwNIKU6Xb0FAAPpGfJ/\nn53nHyJOjrjmDOHzwLYJV4kV1hHmkZ83igagiMa2RIrNYxi3Y+gpc7u+wfLx9ckB\niqorI6A4Pm4V\n-----END CERTIFICATE-----\n",
        "1.previewnet.hedera.com":
            "-----BEGIN CERTIFICATE-----\nMIIE5TCCA02gAwIBAgIURwoT+NqcZeACXQ+MvDLOOr3XkjAwDQYJKoZIhvcNAQEM\nBQAwgY8xCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFy\nZHNvbjEQMA4GA1UECgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQx\nETAPBgNVBAMMCDAwMDAwMDAxMSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRz\nLmNvbTAgFw0yMDA1MTMwMDMwMjdaGA8yMjk0MDIyNTAwMzAyN1owgY8xCzAJBgNV\nBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFyZHNvbjEQMA4GA1UE\nCgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQxETAPBgNVBAMMCDAw\nMDAwMDAxMSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRzLmNvbTCCAaIwDQYJ\nKoZIhvcNAQEBBQADggGPADCCAYoCggGBANK4T9wGRqqya47JJ/Bdw1C5Vgr2pkCq\nDhWZTtKU9KfempBtQ30ZNfIlAUHxPcHWAIupl2bLDS5chWTI6aAoE8AR0EGVDiak\nYqofYnyMQFHreXbhoVwup2O7N6HysMdmEMe2dFzEuPH/kAIMHL9eCgLv8gK+w1Xc\nz5qU/zcCDdP4azNPiY8llW7u16IOAysKyubjcmlX7CntAJK73Bbifkbu6SdJsP0a\nr/9ED4zoAwLWcSPTNXCMwkwkhr0I8spNBAWo4oozYyYvTzLSdFIQlHu5V9h/CYwW\nws8vWfGyV2n9yB3QsuSjIV86V8KFBU2tRwOWct6bWmdlHXcD19oXcRtCSEV3Jg6A\npDaI7e2Ldr8X0Vvewcn4CctMKVj4XBbOxy32cL6qgNZE70KVMaPt4PyAwge3BKCa\npb/v2R9A6Y7HcYy3IUoQS2Ow2cQkuoaNTObAK5nELMqBdw2dcaDA2eW3KUq8xiIw\nmiUrZOsX0q6U7b51i9F8rYaeCroiiqNGwwIDAQABozUwMzAPBgNVHREECDAGhwR/\nAAABMAsGA1UdDwQEAwIEMDATBgNVHSUEDDAKBggrBgEFBQcDATANBgkqhkiG9w0B\nAQwFAAOCAYEAPYrTBmbIiDTDFABLURTpKZinRD6mNaHMXGxbQqeawIvP6ZfOUpIW\nBUQ6EYieqnEOjPXTaqQ+NcOG8zsfQDBipg/tU7NDY6DuFelwwBhU9B8upsdK3SP7\nGgbhlwbXiJLVwVtqkkB91oSUfgkHiVGPK6eAjpiS4Z7uyiAP7nVTyftCposRBHpP\ns0IjNPSWgClA7mB6QM2FQvjidgTAi4CvQ+5rCH9v8qwIb9GzotgpV8NCR1ubU/S5\n8ykWp2U793lyMAREhD/f4llGPZd+9QSSyEl6yqdzLULpLLpu+G2PAzJpoNkUFsGQ\n8xv+qmupU3FqvMeFqzjiDbgQ1bYjDiuXPDXfLGpihybLfvsMp3RLACwL6S+DP3RG\nfu1ggyhH9Ibz5IVhoLYWiumY1vTE0LFCgoJq98XQdqQp+lfHjhjm6BPDBDp5pT8+\nVepZ2MucYB4Fd8t8DHYc2wtFzeQE4o9lWt+n5pd+1nCoS/m28CJdH/a9duVqKVVl\nyJjRlkYQveMA\n-----END CERTIFICATE-----\n",
        "2.previewnet.hedera.com":
            "-----BEGIN CERTIFICATE-----\nMIIE5TCCA02gAwIBAgIUG5QIv2HaYf299J7uZT4tZ1wNgu8wDQYJKoZIhvcNAQEM\nBQAwgY8xCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFy\nZHNvbjEQMA4GA1UECgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQx\nETAPBgNVBAMMCDAwMDAwMDAyMSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRz\nLmNvbTAgFw0yMDA1MTMwMDMwNDZaGA8yMjk0MDIyNTAwMzA0NlowgY8xCzAJBgNV\nBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFyZHNvbjEQMA4GA1UE\nCgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQxETAPBgNVBAMMCDAw\nMDAwMDAyMSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRzLmNvbTCCAaIwDQYJ\nKoZIhvcNAQEBBQADggGPADCCAYoCggGBAME4QeoLPwm5y+AYHN6qEeq8LAtXIG5y\nV/vbxARjuH5INRWeu5IySYXqR1b5f+qf5INe6bPI1Gvcy4wH2ErnFpQ4Qq/wugsd\nW+GQOF4v/mNQlQjEUMECj9++EgN1D91k6cp0bRZBCkgpuXuAaPbArsTGrafmHoP3\nkay3c9J6Djk1hibjK7gpn+C5xkSn0PEPU684kFO97qnmT8qHt6VAMeJKBFTCTulF\nUpQrcbLr98YpUx6Kqzp3I5gzdas6rBnpxGMD4W25biKfwHeNF4rduQv5eadsl1Lz\nqEBcavZ9QEW948BvFQO6zou1rEzGuOE2SCFpMMISN6ESUconowKlyKEDJTwjHTxU\nDhr+dYADv8g4CQrJdbauQzErJcxS+nv1DPQ8DQzZH3z9kNxa9fv+18NXQWtlzqgB\nZAiXgbn4l/IQCUneXo6K1Y+L1HjD5NktMF6zhczz4K8kUcFVtTVBT0dZuF7Ffwc3\n2HGFNVq9uvyFnniq9SZE/0Dm6g65vbCQxwIDAQABozUwMzAPBgNVHREECDAGhwR/\nAAABMAsGA1UdDwQEAwIEMDATBgNVHSUEDDAKBggrBgEFBQcDATANBgkqhkiG9w0B\nAQwFAAOCAYEAriaQN6e701hA/2boGYXo9uzD8CbEV/MMU3lofiG0S4InPYW3Grvf\nBjeLhfn3fHJ5y6TS3DALpQHQUllmFDU2h+/isRA/aAAQ/hQRpKPYlUUOa65axWXV\n2PBBsyYoy0EsvS6El5SUqfx0/EA7+4jC6Z3LMouiI5P8409XGx/hf7g07dpvPVD1\nTQZZIpzLcgJSV+5rYEd+QFq07BUznrsbwOqGcXWjV3BKekxs1KOalcSfsbXEULX7\nBbf5afW/N7Ptc/wVZYx7nrqTjnmmLSs3j+eb46c80hDQv3x79ZirSiRg3yyyZCXA\n/if15d+nhu8sYdHQ6LLUI9VQNjL49aNAk4BVESvfhbizXzw+KHyGE+sGNTy0ReNQ\n3bgEwlQioSpg2Nz1jrEewnyj0pBPeWdFRcVTfMnUuCrifscB2yjPNwPKl4tEukmH\nnGIKhwbxX86leAYPCu9ZTFowi8ZOPZx+PYmFUMqKOJXV5rdhTJY5pIXzaLNOYQGj\nMgLMoqv6DU6V\n-----END CERTIFICATE-----\n",
        "3.previewnet.hedera.com":
            "-----BEGIN CERTIFICATE-----\nMIIE5TCCA02gAwIBAgIUEpJcd1/gIK2aqpblDnj0UP+qRD8wDQYJKoZIhvcNAQEM\nBQAwgY8xCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFy\nZHNvbjEQMA4GA1UECgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQx\nETAPBgNVBAMMCDAwMDAwMDAzMSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRz\nLmNvbTAgFw0yMDA1MTMwMDMyNTdaGA8yMjk0MDIyNTAwMzI1N1owgY8xCzAJBgNV\nBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFyZHNvbjEQMA4GA1UE\nCgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQxETAPBgNVBAMMCDAw\nMDAwMDAzMSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRzLmNvbTCCAaIwDQYJ\nKoZIhvcNAQEBBQADggGPADCCAYoCggGBAJv1ad6GlSunmmqhSeEgXv+4wuhsupj/\ntQLy9ohtQ3369LbTEYuzj/2DjL+yml3Fk+ZnnA0YzZZzgYqUzm9Wh/JtFy6FTrw4\nhXi4lhyjQkndXw5DxGvlUb7KFB1pp6o/6A9IOHg3mckFBpzLrLpUNHywSm6Olc8M\nOTLfzgKl45UuObbOYjGcsJq+dnJcRmivEW41Mlg9JkLGqaCYyFeyPW3ziHGuyHzl\nfIgipzJ3heGrEdnuoKUMJVErptE2lsq2AH2M6sKMLFknMLr9Ozj6x+n4GIMU/Kzm\nbsmRERK9u4es8BmT681bGaeze5nCnuWl8BvccUDOqvnFMwW4Ph8ZNxQGxJVCKPhg\nmAQQO552Ocbp1OmPJEjNVQTYT+UuvWbAFBMswO/2lXV9dtvcHotnjPjrpCjRu3/L\nAAHMbuL9b1NzTrG7h++cUMYlfbpvZZqI5KkqLJvhHPaF3PQh5OxxjWD3ZX2F8zf/\nTgdn7+axIDLFU77I3boYryfIOlnlbylLywIDAQABozUwMzAPBgNVHREECDAGhwR/\nAAABMAsGA1UdDwQEAwIEMDATBgNVHSUEDDAKBggrBgEFBQcDATANBgkqhkiG9w0B\nAQwFAAOCAYEAkTYCUDqvs+j6lSZK/CAPPrWtTsSnuw1qe1U1HhYR4tezVc9B9VdT\nRK1YUkvU0LfUrg5ynTCITa+IqohSyfIf32KGkol1ha63OUK1KB0Um7JJdrHUTO4k\nSfKNPmE1tg3jWab3bh8VOA+C/8p1eulLFjnSg/bxFLpwQaGN4tfROHDkSxLZ5/kS\n5qGsyI47GRDMJimrYgNFaU776RF9Oy0y+9ZRIufTIhs3FSLmvtFr5fD3g3wdMtF6\nz+PjM95fL7M+uD3H6vhI7z19ZCpRj+aOTzlNluT0J5GVcaeC2roOOYtSu4s5ZvXz\npXCcqyyORgcc/IS0kg334u4d4gM5s56JTuaXrNPYk0YHFhxz5wmr+1TXWY3gD5/W\nfsqbf7HNM4BwGSiBdTQeiO9ISJF4PvhpPqQbiUbB8So6W/7oL8GTgH1t7pryEoKv\n+EEWbC4dVL78RsGYc3O/GSHEsGT3Bw2qUsWd890h/nCH+WwVDIQ/2CZ3KIkoc4jS\nH+iAKgs2Iwaa\n-----END CERTIFICATE-----\n",
        "4.previewnet.hedera.com":
            "-----BEGIN CERTIFICATE-----\nMIIE5TCCA02gAwIBAgIUIH0ZU11SX6wrfqwPoht1QyM7vyAwDQYJKoZIhvcNAQEM\nBQAwgY8xCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFy\nZHNvbjEQMA4GA1UECgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQx\nETAPBgNVBAMMCDAwMDAwMDA0MSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRz\nLmNvbTAgFw0yMDExMTAyMTM0NDBaGA8yMjk0MDgyNTIxMzQ0MFowgY8xCzAJBgNV\nBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFyZHNvbjEQMA4GA1UE\nCgwHU3dpcmxkczEXMBUGA1UECwwOSGVkZXJhIE1haW5uZXQxETAPBgNVBAMMCDAw\nMDAwMDA0MSAwHgYJKoZIhvcNAQkBFhFhZG1pbkBzd2lybGRzLmNvbTCCAaIwDQYJ\nKoZIhvcNAQEBBQADggGPADCCAYoCggGBALTQ71yt8kzTXsueZIGZC9h9zJGiA0QD\n60ghQyNpqUv4Ay8QX4lA8f9lNwNOte2KEiQnlvKBQkwhyrjxlyILlTs751HoxpBy\nlW0sxYKKTPwmA365zB0pu1KN1hj8oS2HLWPLd/ZA9+RqksPYRe9TUw4+taTjHKUG\nJP36XRN6A2hLrl7CGEutkoI8QyVgtsk3M6PM610/ufEDsf46I+teQ2k1xqiQVhKG\nd7KYE3GuxkZN+Qh6mXynUAl6KCSOX7oQXNvLtXPdR0B0NqoVY53xpcNGHFSMZO/n\nYootrZKXtJ7m/xuGGCsOh0stDHX9dyGwoF3jFHzFZhN48APDJCiUZai8O8QQfqjn\nYeis1bnXrZtAhvLnA3bTB/EJ2SLZfK3OKRUFe8yXlkVw7H90nDSMMcIsuSqotxjN\nL8eCFKYdJMRUCpzKmiat0bbcKKKwxT4G6IBJqHy74wXeG9PQUrqSHclle22yG8XF\nnqAVz0/8S2LGFH3DaOFGSVntpZoaTKsUFQIDAQABozUwMzAPBgNVHREECDAGhwR/\nAAABMAsGA1UdDwQEAwIEMDATBgNVHSUEDDAKBggrBgEFBQcDATANBgkqhkiG9w0B\nAQwFAAOCAYEANMP2x/7jgNhxfONt4c3EC9LaeiXFX1uocyfL82bdqmp4WVycU8Cy\nGpKk9cL0xN3zpOTuR5J+XkPe0ZiiT8xOkKtRcCWs4pSbW2u9GDN474k36OTCfoZ8\n3HDWZJX6QnU89SVcmEt/W9sCgNRj7cRUwFwsVLX/I1uNTY+zLLtE4IxWIbNAyebw\nha2f8A+x+8vz4SagEji1UW7bTj4qRjrnH/vPxiFhX8kqE8U/92GJ2yNx1swze8yH\nUiyq6G/jUbfkXwloEsntBMwn5NDHsEc5nWJ9LLB22/aqWf/TEFkPn4EiVicmMkGg\n6dZNPANfrQe6T5Mk/C7wXs2hfHDhFqCSiGCb4hMeT/HLPscwYpAlRTNf1y1Xicld\nFuuH7JobAQdOAQBC9WorAp0ORm7KT7OFllGKJaBwx8JHM/Q6r4dWDdzCyMKQC6BG\nyAv4zaPQU8XbJpvKfUYs0LFWSzY3XASRAcLsVF6BTGmYtxYKpenAkka/SbXupy5O\nQKNwuKF2USdX\n-----END CERTIFICATE-----\n",
    },
};
