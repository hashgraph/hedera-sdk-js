import { FileDeleteTransaction } from "../../../src/exports";
import {mockClient, privateKey} from "../MockClient";

describe("FileDeleteTransaction", () => {
    it("serializes and deserializes correctly; FileDeleteTransaction", () => {
        const transaction = new FileDeleteTransaction()
            .setFileId({ shard: 0, realm: 0, file: 5 })
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
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeJIBBBICGAU=",
            sigmap: {
                sigpairList: [
                    {
                        contract: "",
                        ecdsa384: "",
                        ed25519: "0jJ2AZn6SwAuQ1t4aF6BajIzMo+acjjahE3MedPKVtcNArkz9skOVPjIvbbIvOWyUVJzVh0/E+AUK2DJB0kqCgoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHiSAQQSAhgF",
                        pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                        rsa3072: ""
                    }
                ]
            },
            sigs: undefined
        });
    });
});
