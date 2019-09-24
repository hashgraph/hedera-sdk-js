import {mockClient, privateKey} from "../MockClient";
import {FileUpdateTransaction} from "../../exports";

describe("FileUpdateTransaction", () => {
    it('serializes and deserializes correctly; FileUpdateTransaction', () => {
        const transaction = new FileUpdateTransaction(mockClient)
            .setFileId({ shard: 0, realm: 0, file: 5 })
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
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeJoBSgoCGAUSDAiPlP+ygi8QzuqBBRokCiISIODI7CdYpYef+sImoTwMUWt5nnLjUUGg3YKPlNN5iKS3IhBOGKyKy2F5+KV5yie16e2w",
            sigmap: undefined,
            sigs: undefined
        });
    });
});