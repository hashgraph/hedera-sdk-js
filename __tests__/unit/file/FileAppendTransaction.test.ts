import {mockClient, privateKey} from "../MockClient";
import { FileAppendTransaction } from "../../../src/exports";

describe("FileAppendTransaction", () => {
    it("serializes and deserializes correctly; FileAppendTransaction", () => {
        const transaction = new FileAppendTransaction()
            .setFileId({ shard: 0, realm: 0, file: 5 })
            .setContents("This is some random data")
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
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeIIBHhICGAUiGFRoaXMgaXMgc29tZSByYW5kb20gZGF0YQ==",
            sigmap: {
                sigpairList: [
                    {
                        contract: "",
                        ecdsa384: "",
                        ed25519: "AARYvUSlhpKLrulpEjjC1ccX83MxX68Fgdp+scguTffn3lfXePg/O8b+fvChYqQ1mpCHiby+bp0r97+ag6mSDwoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHiCAR4SAhgFIhhUaGlzIGlzIHNvbWUgcmFuZG9tIGRhdGE=",
                        pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                        rsa3072: ""
                    }
                ]
            },
            sigs: undefined
        });
    });
});
