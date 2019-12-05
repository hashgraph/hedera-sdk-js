import { BaseClient, ClientConfig } from "./BaseClient";
import { grpc as grpcWeb } from "@improbable-eng/grpc-web";

import * as grpc from "grpc";
import ProtobufMessage = grpcWeb.ProtobufMessage;
import UnaryMethodDefinition = grpcWeb.UnaryMethodDefinition;

export * from "./exports";

const testNet = { "0.testnet.hedera.com:50211": { shard: 0, realm: 0, account: 3 }};

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
