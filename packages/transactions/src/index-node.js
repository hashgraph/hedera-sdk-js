import BaseClient from "./BaseClient.js";
import { grpc as grpcWeb } from "@improbable-eng/grpc-web";
import * as fs from "fs";
import * as util from "util";
import * as grpcNode from "@grpc/grpc-js";

import { Hbar, TopicId, FileId, AccountId, ContractId, TransactionId, Status } from "./exports.js";
export * from "./exports.js";

const readFile = util.promisify(fs.readFile);

const testNet = { "0.testnet.hedera.com:50211": { shard: 0, realm: 0, account: 3 }};

/**
 * @type {import("./BaseClient.js").Nodes}
 */
const mainnetNodes = {
    "35.237.200.180:50211": "0.0.3",
    "35.186.191.247:50211": "0.0.4",
    "35.192.2.25:50211": "0.0.5",
    "35.199.161.108:50211": "0.0.6",
    "35.203.82.240:50211": "0.0.7",
    "35.236.5.219:50211": "0.0.8",
    "35.197.192.225:50211": "0.0.9",
    "35.242.233.154:50211": "0.0.10",
    "35.240.118.96:50211": "0.0.11",
    "35.204.86.32:50211": "0.0.12"
};

/**
 * @type {import("./BaseClient.js").Nodes}
 */
const testnetNodes = {
    "0.testnet.hedera.com:50211": "0.0.3",
    "1.testnet.hedera.com:50211": "0.0.4",
    "2.testnet.hedera.com:50211": "0.0.5",
    "3.testnet.hedera.com:50211": "0.0.6"
};

/**
 * @type {import("./BaseClient.js").Nodes}
 */
const previewnetNodes = {
    "0.previewnet.hedera.com:50211": "0.0.3",
    "1.previewnet.hedera.com:50211": "0.0.4",
    "2.previewnet.hedera.com:50211": "0.0.5",
    "3.previewnet.hedera.com:50211": "0.0.6"
};

/**
 * This implementation of `BaseClient` is exported for Node.js usage.
 */
export default class Client extends BaseClient {
    /** 
     * If `nodes` is not specified, the Hedera public testnet is assumed.
     *
     * @param {import("./BaseClient.js").ClientConfig} first
     */
    constructor({ network = testNet, operator }) {
        super(network, operator);
        /**
         * @type {Object.<string, grpcNode.Client>}
         */
        this._nodeClients = Object.keys(network).reduce((prev, url) => ({
            [ url ]: new grpcNode.Client(url, grpcNode.credentials.createInsecure()),
            ...prev
        }), {});
    }

    /**
     * @returns {Client}
     */
    static forMainnet() {
        return new Client({ network: mainnetNodes, operator: undefined });
    }

    /**
     * @returns {Client}
     */
    static forTestnet() {
        return new Client({ network: testnetNodes, operator: undefined });
    }

    /**
     * @returns {Client}
     */
    static forPreviewnet() {
        return new Client({ network: previewnetNodes, operator: undefined });
    }

    /**
     * @param {string} filename
     * @returns {Promise<Client>}
     */
    static async fromFile(filename) {
        return Client.fromJson(await readFile(filename, "utf8"));
    }

    /**
     * @param {string} text
     * @returns {Client}
     */
    static fromJson(text) {
        return new Client(JSON.parse(text));
    }

    /**
     * @returns {void}
     */
    close() {
        for (const client of Object.values(this._nodeClients)) {
            client.close();
        }
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
        return new Promise((resolve, reject) => this._nodeClients[ url ].makeUnaryRequest(
            // this gRPC client takes the full path
            `/${method.service.serviceName}/${method.methodName}`,
            (req) => Buffer.from(req.serializeBinary()),
            (bytes) => method.responseType.deserializeBinary(bytes),
            request,
            new grpcNode.Metadata(),
            {},
            (err, val) => {
                if (err != null) {
                    reject(err);
                } else {
                    resolve(val);
                }
            }
        ));
    }
}

// Mirror
// export { MirrorClient } from "./mirror/node/MirrorClient";
// export { MirrorConsensusTopicQuery } from "./mirror/node/MirrorConsensusTopicQuery";

// Override console.log output for some classes (to be toString)
for (const cls of [
    // TransactionReceipt,
    AccountId,
    FileId,
    TopicId,
    ContractId,
    TransactionId,
    Status,
    Hbar
]) {
    Object.defineProperty(cls.prototype, util.inspect.custom, {
        enumerable: false,
        writable: false,
        /**
         * @returns {string}
         */
        value() {
            return this.toString();
        }
    });
}
