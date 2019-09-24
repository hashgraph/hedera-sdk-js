import {FileCreateTransaction} from "../../exports";
import {mockClient, privateKey} from "../MockClient";

describe("FileCreateTransaction", () => {
    it('serializes and deserializes correctly; FileCreateTransaction', () => {
        const transaction = new FileCreateTransaction(mockClient)
            .setContents("This is the file contents")
            .setExpirationTime({ seconds: 1615551515151, nanos: 10515790 })
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
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeIoBRhIMCI+U/7KCLxDO6oEFGiQKIhIg4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLciEE4YrIrLYXn4pXnKJ7Xp7bA=",
            sigmap: undefined,
            sigs: undefined
        });
    });
});