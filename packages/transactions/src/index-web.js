import BaseClient from "./BaseClient.js";
import { grpc as grpcWeb } from "@improbable-eng/grpc-web";

export * from "./exports.js";

const mainnetProxy = { "https://grpc-web.myhbarwallet.com": { shard: 0, realm: 0, account: 3 }};

const testnetProxy = { "https://grpc-web.testnet.myhbarwallet.com": { shard: 0, realm: 0, account: 3 }};

const previewnetProxy = { "https://grpc-web.previewnet.myhbarwallet.com": { shard: 0, realm: 0, account: 3 }};

/** This implementation of `BaseClient` is exported for browser usage. */
export default class Client extends BaseClient {
    /**
     * If `network` is not specified, default url is a proxy to 0.testnet.hedera.com:50211 generously
     * hosted by MyHbarWallet.com. Mainnet proxy to come later.
     *
     * @param {import("./BaseClient.js").ClientConfig} first
     */
    constructor({ network = testnetProxy, operator }) {
        super(network, operator);
    }

    /**
     * @returns {Client}
     */
    static forMainnet() {
        return new Client({ network: mainnetProxy, operator: undefined  });
    }

    /**
     * @returns {Client}
     */
    static forTestnet() {
        return new Client({ network: testnetProxy, operator: undefined });
    }

    /**
     * @returns {Client}
     */
    static forPreviewnet() {
        return new Client({ network: previewnetProxy, operator: undefined });
    }

    /**
     * @returns {Promise<Client>}
     */
    static fromFile() {
        throw new Error("Client.fromFile is not supported in the browser");
    }

    /**
     * @param {string} text
     * @returns {Client}
     */
    static fromJson(text) {
        return new Client(JSON.parse(text));
    }

    /**
     * @returns {Promise<void>}
     */
    close() {
        throw new Error("Client.close is not supported in the browser");
    }

    /**
     * NOT A STABLE API
     *
     * @template {grpcWeb.ProtobufMessage} Rq
     * @template {grpcWeb.ProtobufMessage} Rs
     * @param {string} url
     * @param {Rq} request
     * @param {grpcWeb.UnaryMethodDefinition<Rq, Rs>} method
     * @returns {Promise<Rs>}
     */
    // eslint-disable-next-line @typescript-eslint/member-naming
    _unaryCall(url, request, method) {
        return new Promise((resolve, reject) => grpcWeb.unary(method, {
            host: url,
            request,
            onEnd(
                /**
                 * @type {grpcWeb.UnaryOutput<Rs>}
                 */
                response
            ) {
                if (response.status === grpcWeb.Code.OK && response.message != null) {
                    resolve(response.message);
                } else {
                    reject(new Error(response.statusMessage));
                }
            }
        }));
    }
}

// Mirror
// export { MirrorConsensusTopicQuery } from "./mirror/web/MirrorConsensusTopicQuery";
