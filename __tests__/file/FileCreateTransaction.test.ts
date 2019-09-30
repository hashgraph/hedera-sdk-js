import { FileCreateTransaction } from "../../exports";
import { mockClient, privateKey } from "../MockClient";

describe("FileCreateTransaction", () => {
    it("serializes and deserializes correctly; FileCreateTransaction", () => {
        const transaction = new FileCreateTransaction(mockClient)
            .setContents("This is the file contents")
            .setExpirationTime(new Date(15415151511))
            .addKey(privateKey.publicKey)
            .setTransactionFee(1e6)
            .setTransactionId({
                account: { shard: 0, realm: 0, account: 3 },
                validStartSeconds: 124124,
                validStartNanos: 151515
            })
            .build();

        const tx = transaction.toProto().toObject();
        expect(tx).toStrictEqual({
            body: undefined,
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeIoBRRILCO/urAcQwPvU8wEaJAoiEiDgyOwnWKWHn/rCJqE8DFFreZ5y41FBoN2Cj5TTeYiktyIQThisisthefilecontentsA==",
            sigmap: undefined,
            sigs: undefined
        });
    });
});
