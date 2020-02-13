import { SystemDeleteTransaction } from "../../src/exports";
import {mockClient, privateKey} from "./MockClient";

describe("SystemDeleteTransaction", () => {
    it("serializes and deserializes correctly; SystemDeleteTransaction", () => {
        const transaction = new SystemDeleteTransaction()
            .setFileId(3)
            .setExpirationTime(new Date(15415151511))
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
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeKIBCwoCGAMaBQjv7qwH",
            sigmap: {
                sigpairList: [
                    {
                        contract: "",
                        ecdsa384: "",
                        ed25519: "34PB8UbInvdXn/FPzi6i7m7BE++12XWtATnnoJzz+tJsHjWSskiEcg8JYduCT5l3+v7c2h/y1EpO3GA5qbN1CgoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHiiAQsKAhgDGgUI7+6sBw==",
                        pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                        rsa3072: ""
                    }
                ]
            },
            sigs: undefined
        });
    });
});
