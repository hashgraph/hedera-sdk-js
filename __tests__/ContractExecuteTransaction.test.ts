import {BaseClient, unaryCall} from "../src/BaseClient";
import {grpc} from "@improbable-eng/grpc-web";
import {Ed25519PrivateKey} from "../src/Keys";
import ProtobufMessage = grpc.ProtobufMessage;
import {ContractExecuteTransaction} from "../src/contract/ContractExecuteTransaction";

const privateKey = Ed25519PrivateKey.fromString('302e020100300506032b657004220420db484b828e64b2d8f12ce3c0a0e93a0b8cce7af1bb8f39c97732394482538e10');

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

    public [unaryCall]<Rq extends ProtobufMessage, Rs extends ProtobufMessage>(): Promise<Rs> {
        throw new Error('should not be called');
    }
}

const mockClient = new MockClient();

describe("ContractExecuteTransaction", () => {
    it('serializes and deserializes correctly; ContractExecuteTransaction', () => {
        const transaction = new ContractExecuteTransaction(mockClient)
            .setContractId({ shard: 0, realm: 0, contract: 5 })
            .setGas(141)
            .setAmount(10000)
            .setFunctionParameters("These are random parameters")
            .setTransactionFee(1e6)
            .setTransactionId({
                account: { shard: 0, realm: 0, account: 3 },
                validStartSeconds: 124124,
                validStartNanos: 151515
            })
            .build()
            .sign(privateKey);

        // const tx = new TextDecoder("ascii").decode(transaction.toProto().toS);
        const tx = transaction.toProto().toObject();
        expect(tx).toStrictEqual({
            body: undefined,
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeDoeCgIYBRCNARiQTiISThesearerandomparameters",
            sigmap: {
                sigpairList: [{
                    contract: "",
                    ecdsa384: "",
                    ed25519: "IpjyHWtt1KSzFpVUBS1UVKpMUms8og/JCBtaYwwIgiAg7uD3eekGIVK40mYAGhHF7GbUfpqHeKdcgM9Fx+rbCQoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHg6HgoCGAUQjQEYkE4iEk4XrHmq3q2p3aJqWq2pnrXq7A==",
                    pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                    rsa3072: ""
                }]
            },
            sigs: undefined
        });
    });
});