import { FileCreateTransaction } from "../../../src/exports";
import { mockClient, privateKey } from "../MockClient";

describe("FileCreateTransaction", () => {
    it("serializes and deserializes correctly; FileCreateTransaction", () => {
        const transaction = new FileCreateTransaction()
            .setContents("This is the file contents")
            .setExpirationTime(new Date(15415151511))
            .addKey(privateKey.publicKey)
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
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeIoBThILCO/urAcQwPvU8wEaJAoiEiDgyOwnWKWHn/rCJqE8DFFreZ5y41FBoN2Cj5TTeYiktyIZVGhpcyBpcyB0aGUgZmlsZSBjb250ZW50cw==",
            sigmap: {
                sigpairList: [
                    {
                        contract: "",
                        ecdsa384: "",
                        ed25519: "H9DXT7WjEMPmNt0UNen4/+RFkNOtE8Ir/FmARR6c8RVGNiJ9FVZSsdQCWoom7CJxBZcptoyxGeiBkomBqZ2QBgoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHiKAU4SCwjv7qwHEMD71PMBGiQKIhIg4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLciGVRoaXMgaXMgdGhlIGZpbGUgY29udGVudHM=",
                        pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                        rsa3072: ""
                    }
                ]
            },
            sigs: undefined
        });
    });
});
