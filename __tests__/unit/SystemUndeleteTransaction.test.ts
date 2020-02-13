import { SystemUndeleteTransaction } from "../../src/exports";
import {mockClient, privateKey} from "./MockClient";

describe("SystemUndeleteTransaction", () => {
    it("serializes and deserializes correctly; SystemUndeleteTransaction", () => {
        const transaction = new SystemUndeleteTransaction()
            .setFileId({ file: 3 })
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
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeKoBBAoCGAM=",
            sigmap: {
                sigpairList: [
                    {
                        contract: "",
                        ecdsa384: "",
                        ed25519: "qvS+HQClMp+3DO5sB4Ik4t2hnMPeRwUkYTEXOkf1RciQhOnnDdoveVfFzQk0NarOur/mx+eVZjNSLZuUURXBAQoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHiqAQQKAhgD",
                        pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                        rsa3072: ""
                    }
                ]
            },
            sigs: undefined
        });
    });
});
