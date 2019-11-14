import { mockClient } from "../MockClient";
import { FileAppendTransaction } from "../../src/exports";

describe("FileAppendTransaction", () => {
    it("serializes and deserializes correctly; FileAppendTransaction", () => {
        const transaction = new FileAppendTransaction()
            .setFileId({ shard: 0, realm: 0, file: 5 })
            .setContents("This is some random data")
            .setTransactionFee(1e6)
            .setTransactionId({
                account: { shard: 0, realm: 0, account: 3 },
                validStartSeconds: 124124,
                validStartNanos: 151515
            })
            .build(mockClient);

        const tx = transaction.toProto().toObject();
        expect(tx).toStrictEqual({
            body: undefined,
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeIIBFRICGAUiD04YrIrLKJnq2p3aJnWrWg==",
            sigmap: {
                sigpairList: [{
                      contract: "",
                      ecdsa384: "",
                      ed25519: "U+rHe8KHX5uFILbvdYSSEqB8RdMlMq25G1ckP6YvsmFOguC/A+tmQaf8UEEsIElCzabo6y+Hf3xB6IMUNxylBAoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHiCARUSAhgFIg9OGKyKyyiZ6tqd2iZ1q1o=",
                      pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                      rsa3072: "",
                }]
            },
            sigs: undefined
        });
    });
});
