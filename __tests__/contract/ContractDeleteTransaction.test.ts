import { ContractDeleteTransaction } from "../../src/contract/ContractDeleteTransaction";
import { mockClient, privateKey } from "../MockClient";

describe("ContractDeleteTransaction", () => {
    it("serializes and deserializes correctly; ContractDeleteTransaction", () => {
        const transaction = new ContractDeleteTransaction(mockClient)
            .setContractId({ shard: 0, realm: 0, contract: 5 })
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
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeLIBBAoCGAU=",
            sigmap: {
                sigpairList: [
                    {
                        contract: "",
                        ecdsa384: "",
                        ed25519: "z858sDlRVMUczlhCHOovkMAGOuBOaS43c/mVAcA4OM7QY3lzSgz6CcD3u99/EioEZnwZV4EPVz9rUUTwMfN4AwoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHiyAQQKAhgF",
                        pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                        rsa3072: ""
                    }
                ]
            },
            sigs: undefined
        });
    });
});
