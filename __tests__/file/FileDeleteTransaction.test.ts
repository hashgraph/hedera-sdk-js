import {FileDeleteTransaction} from "../../exports";
import {mockClient} from "../MockClient";

describe("FileDeleteTransaction", () => {
    it('serializes and deserializes correctly; FileDeleteTransaction', () => {
        const transaction = new FileDeleteTransaction(mockClient)
            .setFileId({ shard: 0, realm: 0, file: 5 })
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
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeJIBBBICGAU=",
            sigmap: undefined,
            sigs: undefined
        });
    });
});