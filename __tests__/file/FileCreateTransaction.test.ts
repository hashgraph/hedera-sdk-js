import { FileCreateTransaction } from "../../src/exports";
import { mockClient, privateKey } from "../MockClient";

describe("FileCreateTransaction", () => {
    it("serializes and deserializes correctly; FileCreateTransaction", () => {
        const transaction = new FileCreateTransaction()
            .setContents("This is the file contents")
            .setExpirationTime(new Date(15415151511))
            .addKey(privateKey.publicKey)
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
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeIoBRRILCO/urAcQwPvU8wEaJAoiEiDgyOwnWKWHn/rCJqE8DFFreZ5y41FBoN2Cj5TTeYiktyIQThisisthefilecontentsA==",
            sigmap: {
            sigpairList: [{
                contract: "",
                ecdsa384: "",
                ed25519: "76ilivBgtIJ3/FkcbWYxz4ndfYwzY8q8nKXBeX8k1nlWyHr007Bo+gRK3J3FvaVN2NJ45tyW4pWeYoGiu6EyDwoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHiKAUUSCwjv7qwHEMD71PMBGiQKIhIg4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLciEE4YrIrLYXn4pXnKJ7Xp7bA=",
                pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                rsa3072: "",
               }],
            },
            sigs: undefined
        });
    });
});
