import { AccountDeleteTransaction } from "../../src/exports";
import { mockClient } from "../MockClient";

describe("AccountDeleteTransaction", () => {
    it("serializes and deserializes correctly; AccountDeleteTransaction", () => {
        const transaction = new AccountDeleteTransaction()
            .setAccountId({ account: 3 })
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
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeGIEEgIYAw==",
            sigmap: {
                sigpairList: [{
                    contract: "",
                    ecdsa384: "",
                    ed25519: "YzRkNcQJmckTIFTt8sNbu3SmvaeFDdhfOVrhHCWG1cSaWQUGjQ0S1uT8uVlAIe3HUowEBmBY0HH3Aw+pLTsBDwoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHhiBBICGAM=",
                    pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                    rsa3072: "",
                }],
            },
            sigs: undefined
        });
    });
});
