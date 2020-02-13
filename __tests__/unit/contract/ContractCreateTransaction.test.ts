import { ContractCreateTransaction } from "../../../src/exports";
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
            .build(mockClient)
            .sign(privateKey);

        const tx = transaction._toProto().toObject();
        expect(tx).toStrictEqual({
            body: undefined,
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeEI3CgIYBBoiEiDgyOwnWKWHn/rCJqE8DFFreZ5y41FBoN2Cj5TTeYiktyBkKOgHMgIYA0IECIDqSQ==",
            sigmap: {
                sigpairList: [
                    {
                        contract: "",
                        ecdsa384: "",
                        ed25519: "tIaKEQ3Slu4LCmZDWmEjeSrOnG43bj1PI0HbTnswHtjCEGnnnqnAZ1S3nvmbzzBVZx4xgYjzi1ORz1Xpf22ZAgoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHhCNwoCGAQaIhIg4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLcgZCjoBzICGANCBAiA6kk=",
                        pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                        rsa3072: ""
                    }
                ]
            },
            sigs: undefined
        });
    });
});
