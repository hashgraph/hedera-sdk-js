import {Ed25519PrivateKey} from "../src/Keys";
import {BaseClient} from "../src/BaseClient";
import {grpc} from "@improbable-eng/grpc-web";
import ProtobufMessage = grpc.ProtobufMessage;
import {CryptoTransferTransaction} from "../exports";

export const privateKey = Ed25519PrivateKey.fromString('302e020100300506032b657004220420db484b828e64b2d8f12ce3c0a0e93a0b8cce7af1bb8f39c97732394482538e10');

class MockClient extends BaseClient {
    public constructor() {
        super(
            { 'nonexistent-testnet': { shard: 0, realm: 0, account: 3 } },
            {
                account: { shard: 0, realm: 0, account: 2 },
                privateKey
            }
        );
    }

    public _unaryCall<Rq extends ProtobufMessage, Rs extends ProtobufMessage>(): Promise<Rs> {
        throw new Error('should not be called');
    }
}

export const mockClient = new MockClient();

export const mockTransaction = new CryptoTransferTransaction(mockClient)
    .addSender({ shard: 0, realm: 0, account: 2}, 100)
    .addRecipient({ shard: 0, realm: 0, account: 3}, 100)
    .setTransactionFee(8000000)
    .setTransactionFee(1e6)
    .setTransactionId({
        account: { shard: 0, realm: 0, account: 3 },
        validStartSeconds: 124124,
        validStartNanos: 151515
    })
    .build();
