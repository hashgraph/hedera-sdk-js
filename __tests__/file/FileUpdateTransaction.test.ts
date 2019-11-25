import { mockClient, privateKey } from "../MockClient";
import { FileUpdateTransaction } from "../../src/exports";

describe("FileUpdateTransaction", () => {
    it("serializes and deserializes correctly; FileUpdateTransaction", () => {
        const transaction = new FileUpdateTransaction()
            .setFileId({ shard: 0, realm: 0, file: 5 })
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
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeJoBSQoCGAUSCwjv7qwHEMD71PMBGiQKIhIg4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLciEE4YrIrLYXn4pXnKJ7Xp7bA=",
            sigmap: {
                sigpairList: [{
                    contract: "",
                    ecdsa384: "",
                    ed25519: "DHcTKXIBZbXzY2kkuAQrMFVF8Y3mqIo93uqYKB+34ah8EDOjeCwuR87GQ7ycpRbjWmT0IPeTK4D79eIoz1dyDgoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHiaAUkKAhgFEgsI7+6sBxDA+9TzARokCiISIODI7CdYpYef+sImoTwMUWt5nnLjUUGg3YKPlNN5iKS3IhBOGKyKy2F5+KV5yie16e2w",
                    pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                    rsa3072: "",
                }]
            },
            sigs: undefined
        });
    });
});
