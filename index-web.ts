import {BaseClient, ClientConfig} from "./src/BaseClient";
import {grpc} from "@improbable-eng/grpc-web";
import ProtobufMessage = grpc.ProtobufMessage;
import UnaryOutput = grpc.UnaryOutput;
import Code = grpc.Code;

export * from './exports';

const testnetProxy = {
    'https://grpc-web.myhederawallet.com': { shard: 0, realm: 0, account: 3 }
};

/** This implementation of `BaseClient` is exported for browser usage. */
export class Client extends BaseClient {
    /**
     * If `nodes` is not specified, default url is a proxy to 0.testnet.hedera.com:50211 generously
     * hosted by MyHederaWallet.com. Mainnet proxy to come later; this url may change accordingly
     */
    public constructor({ nodes = testnetProxy, operator }: ClientConfig) {
        super(nodes, operator);
    }

    public _unaryCall<Rq extends ProtobufMessage, Rs extends ProtobufMessage>(url: string, request: Rq, method: grpc.UnaryMethodDefinition<Rq, Rs>): Promise<Rs> {
        return new Promise((resolve, reject) => grpc.unary(method, {
            host: url,
            request,
            onEnd: (response: UnaryOutput<Rs>) => {
                if (response.status === Code.OK && response.message) {
                    resolve(response.message);
                } else {
                    reject(new Error(response.statusMessage));
                }
            }
        }));
    }
}
