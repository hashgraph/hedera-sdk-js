import { BaseClient, ClientConfig, Nodes } from "./BaseClient";
import { grpc as grpcWeb } from "@improbable-eng/grpc-web";
import * as fs from "fs";
import * as util from "util";

import * as grpc from "grpc";
import ProtobufMessage = grpcWeb.ProtobufMessage;
import UnaryMethodDefinition = grpcWeb.UnaryMethodDefinition;

import { Hbar, Ed25519PrivateKey, Ed25519PublicKey, TransactionReceipt, ConsensusTopicId, FileId, AccountId, ContractId, TransactionId, Status } from "./exports";
export * from "./exports";

const readFile = util.promisify(fs.readFile);

const testNet = { "0.testnet.hedera.com:50211": { shard: 0, realm: 0, account: 3 }};

const mainnetNodes: Nodes = {
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

const testnetNodes: Nodes = {
    "0.testnet.hedera.com:50211": "0.0.3",
    "1.testnet.hedera.com:50211": "0.0.4",
    "2.testnet.hedera.com:50211": "0.0.5",
    "3.testnet.hedera.com:50211": "0.0.6"
};

/**
 * This implementation of `BaseClient` is exported for Node.js usage.
 */
export class Client extends BaseClient {
    private readonly _nodeClients: {
        [url: string]: grpc.Client;
    };

    /** If `nodes` is not specified, the Hedera public testnet is assumed. */
    public constructor({ network = testNet, operator }: ClientConfig) {
        super(network, operator);
        this._nodeClients = Object.keys(network).reduce((prev, url) => ({
            [ url ]: new grpc.Client(url, grpc.credentials.createInsecure()),
            ...prev
        }), {});
    }

    public static forMainnet(): Client {
        return new Client({ network: mainnetNodes });
    }

    public static forTestnet(): Client {
        return new Client({ network: testnetNodes });
    }

    public static async fromFile(filename: string): Promise<Client> {
        return Client.fromJson(await readFile(filename, "utf8"));
    }

    public static fromJson(text: string): Client {
        return new Client(JSON.parse(text));
    }

    public close(): void {
        for (const client of Object.values(this._nodeClients)) {
            client.close();
        }
    }

    /* eslint-disable-next-line @typescript-eslint/member-naming */
    public _unaryCall<Rq extends ProtobufMessage, Rs extends ProtobufMessage>(
        url: string,
        request: Rq,
        method: UnaryMethodDefinition<Rq, Rs>
    ): Promise<Rs> {
        return new Promise<Rs>((resolve, reject) => this._nodeClients[ url ].makeUnaryRequest(
            // this gRPC client takes the full path
            `/${method.service.serviceName}/${method.methodName}`,
            (req) => Buffer.from(req.serializeBinary()),
            (bytes) => method.responseType.deserializeBinary(bytes),
            request,
            null,
            null,
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
export { MirrorClient } from "./mirror/node/MirrorClient";
export { MirrorConsensusTopicQuery } from "./mirror/node/MirrorConsensusTopicQuery";

// Override console.log output for some classes (to be toString)
for (const cls of [
    TransactionReceipt,
    AccountId,
    FileId,
    ConsensusTopicId,
    ContractId,
    TransactionId,
    Ed25519PrivateKey,
    Ed25519PublicKey,
    Status,
    Hbar
]) {
    Object.defineProperty(cls.prototype, util.inspect.custom, {
        enumerable: false,
        writable: false,
        value(): string {
            return this.toString();
        }
    });
}
