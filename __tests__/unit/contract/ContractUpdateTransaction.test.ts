import { ContractUpdateTransaction } from "../../../src/exports";
import { mockClient, privateKey } from "../MockClient";

describe("ContractUpdateTransaction", () => {
    it("serializes and deserializes correctly; ContractUpdateTransaction", () => {
        const transaction = new ContractUpdateTransaction()
            .setContractId({ shard: 0, realm: 0, contract: 3 })
            .setAdminKey(privateKey.publicKey)
            .setBytecodeFileId({ shard: 0, realm: 0, file: 5 })
            .setExpirationTime(new Date(1569375111277))
            .setProxyAccountId({ shard: 0, realm: 0, account: 3 })
            .setAutoRenewPeriod(60 * 60 * 24 * 14)
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
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeEpECgIYAxIMCIeHq+wFEMDeioQBGiISIODI7CdYpYef+sImoTwMUWt5nnLjUUGg3YKPlNN5iKS3MgIYAzoECIDqSUICGAU=",
            sigmap: {
                sigpairList: [
                    {
                        contract: "",
                        ecdsa384: "",
                        ed25519: "3wq0YLANRbRWyMvhQErqFchjWfr6x2Ew2o0LYI8haJHmERblnRqXv9aWFBXVDe2BihSb4C/X18KhC1xWCCR3CQoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHhKRAoCGAMSDAiHh6vsBRDA3oqEARoiEiDgyOwnWKWHn/rCJqE8DFFreZ5y41FBoN2Cj5TTeYiktzICGAM6BAiA6klCAhgF",
                        pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                        rsa3072: ""
                    }
                ]
            },
            sigs: undefined
        });
    });
});
