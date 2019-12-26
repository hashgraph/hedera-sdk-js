import { ContractCreateTransaction } from "../../src/exports";
import { mockClient, privateKey } from "../MockClient";

describe("ContractCreateTransaction", () => {
    it("serializes and deserializes correctly; ContractCreateTransaction", () => {
        const transaction = new ContractCreateTransaction()
            .setAdminKey(privateKey.publicKey)
            .setInitialBalance(1e3)
            .setBytecodeFileId({ shard: 0, realm: 0, file: 4 })
            .setGas(100)
            .setProxyAccountId({ shard: 0, realm: 0, account: 3 })
            .setAutoRenewPeriod(60 * 60 * 24 * 14)
            .setMaxTransactionFee(1e6)
            .setTransactionId({
                account: { shard: 0, realm: 0, account: 3 },
                validStartSeconds: 124124,
                validStartNanos: 151515
            })
            .build(mockClient);

        const tx = transaction.toProto().toObject();
        expect(tx).toStrictEqual({
            body: undefined,
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeEI7CgIYBBoiEiDgyOwnWKWHn/rCJqE8DFFreZ5y41FBoN2Cj5TTeYiktyBkKOgHMgIYA0IECIDqSVIAWgA=",
            sigmap: {
                sigpairList: [
                    {
                        contract: "",
                        ecdsa384: "",
                        ed25519: "FLqp2sER6MqQXGvem9eJNsDSiYhLA+ZFioBLdi0y9cNQM8/tgWgew6GlD/VG7dhuPTFn0IVLGgbJ8yAWY2bqDgoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHhCOwoCGAQaIhIg4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLcgZCjoBzICGANCBAiA6klSAFoA",
                        pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                        rsa3072: ""
                    }
                ]
            },
            sigs: undefined
        });
    });
});
