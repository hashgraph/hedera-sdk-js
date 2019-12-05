import { BaseClient, ClientConfig } from "./BaseClient";
import { grpc } from "@improbable-eng/grpc-web";
import ProtobufMessage = grpc.ProtobufMessage;
import UnaryOutput = grpc.UnaryOutput;
import Code = grpc.Code;

export * from "./exports";

const testnetProxy = { "https://grpc-web.testnet.myhbarwallet.com": { shard: 0, realm: 0, account: 3 }};

/** This implementation of `BaseClient` is exported for browser usage. */
export class Client extends BaseClient {
    /**
     * If `network` is not specified, default url is a proxy to 0.testnet.hedera.com:50211 generously
     * hosted by MyHbarWallet.com. Mainnet proxy to come later.
     */
    public constructor({ network = testnetProxy, operator }: ClientConfig) {
        super(network, operator);
    }

    /* eslint-disable-next-line @typescript-eslint/member-naming */
    public _unaryCall<Rq extends ProtobufMessage, Rs extends ProtobufMessage>(
        url: string,
        request: Rq,
        method: grpc.UnaryMethodDefinition<Rq, Rs>
    ): Promise<Rs> {
        return new Promise((resolve, reject) => grpc.unary(method, {
            host: url,
            request,
            onEnd(response: UnaryOutput<Rs>) {
                if (response.status === Code.OK && response.message != null) {
                    resolve(response.message);
                } else {
                    reject(new Error(response.statusMessage));
                }
            }
        }));
    }
}
