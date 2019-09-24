import {BaseClient, unaryCall} from "../src/BaseClient";
import {grpc} from "@improbable-eng/grpc-web";
import {Ed25519PrivateKey} from "../src/Keys";
import ProtobufMessage = grpc.ProtobufMessage;
import {ContractUpdateTransaction} from "../src/contract/ContractUpdateTransaction";

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

describe("ContractUpdateTransaction", () => {
    it('serializes and deserializes correctly; ContractUpdateTransaction', () => {
        const transaction = new ContractUpdateTransaction(mockClient)
            .setContractId({ shard: 0, realm: 0, contract: 3 })
            .setAdminkey(privateKey.publicKey)
            .setFileId({ shard: 0, realm: 0, file: 5 })
            .setExpirationTime({ seconds: 1615551515151, nanos: 10515790 })
            .setProxyAccountId({ shard: 0, realm: 0, account: 3 })
            .setAutoRenewPeriod(60 * 60 * 24 * 14)
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
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeEpECgIYAxIMCI+U/7KCLxDO6oEFGiISIODI7CdYpYef+sImoTwMUWt5nnLjUUGg3YKPlNN5iKS3MgIYAzoECIDqSUICGAU=",
            sigmap: {
                sigpairList: [{
                    contract: "",
                    ecdsa384: "",
                    ed25519: "q369xrWjqgxV6D8cOLEeLlGqyVFtHxMIlnSmCeI3dCfUUpANO93DeXvDsUa+TD54hmBDEM9mWvtf6jnhBDItDAoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHhKRAoCGAMSDAiPlP+ygi8QzuqBBRoiEiDgyOwnWKWHn/rCJqE8DFFreZ5y41FBoN2Cj5TTeYiktzICGAM6BAiA6klCAhgF",
                    pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                    rsa3072: ""
                }]
            },
            sigs: undefined
        });
    });
});