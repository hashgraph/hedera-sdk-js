import {mockClient} from "../MockClient";
import {FileAppendTransaction} from "../../exports";

describe("FileAppendTransaction", () => {
    it('serializes and deserializes correctly; FileAppendTransaction', () => {
        const transaction = new FileAppendTransaction(mockClient)
            .setFileId({ shard: 0, realm: 0, file: 5 })
            .setContents("This is some random data")
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
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeIIBFRICGAUiD04YrIrLKJnq2p3aJnWrWg==",
            sigmap: undefined,
            sigs: undefined
        });
    });
});