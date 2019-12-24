import { FileCreateTransaction } from "../../src/exports";
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
            .build(mockClient);

        const tx = transaction.toProto().toObject();
        expect(tx).toStrictEqual({
            body: undefined,
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeIoBUhILCO/urAcQwPvU8wEaJAoiEiDgyOwnWKWHn/rCJqE8DFFreZ5y41FBoN2Cj5TTeYiktyIZVGhpcyBpcyB0aGUgZmlsZSBjb250ZW50cyoAMgA=",
            sigmap: {
                sigpairList: [
                    {
                        contract: "",
                        ecdsa384: "",
                        ed25519: "jLtX6rQFAcvktSP8+NoOcahbL+BShvE0V0I+3+71pS3Z5AiSXWGiO50bVphnG9G9vUS37t9tjYz9IEXPOuztAAoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHiKAVISCwjv7qwHEMD71PMBGiQKIhIg4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLciGVRoaXMgaXMgdGhlIGZpbGUgY29udGVudHMqADIA",
                        pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                        rsa3072: ""
                    }
                ]
            },
            sigs: undefined
        });
    });
});
