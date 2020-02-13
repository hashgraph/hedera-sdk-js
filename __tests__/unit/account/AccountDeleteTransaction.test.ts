import { AccountDeleteTransaction } from "../../../src/exports";
import {mockClient, privateKey} from "../MockClient";

describe("AccountDeleteTransaction", () => {
    it("serializes and deserializes correctly; AccountDeleteTransaction", () => {
        const transaction = new AccountDeleteTransaction()
            .setDeleteAccountId({ account: 3 })
            .setTransferAccountId({ account: 3 })
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
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeGIICgIYAxICGAM=",
            sigmap: {
                sigpairList: [
                    {
                        contract: "",
                        ecdsa384: "",
                        ed25519: "io5bJCT8Z0FlntnjG9eIL/ZidTDCnau4ir0PZjdQ5UYejWpFUEefpnID8vLYEeRkvOtqyma1r1flZZJXr7YRBAoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHhiCAoCGAMSAhgD",
                        pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                        rsa3072: ""
                    }
                ]
            },
            sigs: undefined
        });
    });
});
