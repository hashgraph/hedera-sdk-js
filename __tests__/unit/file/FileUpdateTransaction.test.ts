import { mockClient, privateKey } from "../MockClient";
import { FileUpdateTransaction } from "../../../src/exports";

describe("FileUpdateTransaction", () => {
    it("serializes and deserializes correctly; FileUpdateTransaction", () => {
        const transaction = new FileUpdateTransaction()
            .setFileId({ shard: 0, realm: 0, file: 5 })
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
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeJoBUgoCGAUSCwjv7qwHEMD71PMBGiQKIhIg4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLciGVRoaXMgaXMgdGhlIGZpbGUgY29udGVudHM=",
            sigmap: {
                sigpairList: [
                    {
                        contract: "",
                        ecdsa384: "",
                        ed25519: "o6ZiLnUGqONHANKwEsCgYpPcrMAsLhvnWPx9Yzmb4RkzLSMI45jSYcHQaTnTcAw3N85oqhGhlQ/9+0CSwwkFCAoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHiaAVIKAhgFEgsI7+6sBxDA+9TzARokCiISIODI7CdYpYef+sImoTwMUWt5nnLjUUGg3YKPlNN5iKS3IhlUaGlzIGlzIHRoZSBmaWxlIGNvbnRlbnRz",
                        pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                        rsa3072: ""
                    }
                ]
            },
            sigs: undefined
        });
    });
});
