import { ContractExecuteTransaction } from "../../src/exports";
import { mockClient, privateKey } from "../MockClient";

describe("ContractExecuteTransaction", () => {
    it("serializes and deserializes correctly; ContractExecuteTransaction", () => {
        const transaction = new ContractExecuteTransaction(mockClient)
            .setContractId({ shard: 0, realm: 0, contract: 5 })
            .setGas(141)
            .setAmount(10000)
            .setFunctionParameters("These are random parameters")
            .setTransactionFee(1e6)
            .setTransactionId({
                account: { shard: 0, realm: 0, account: 3 },
                validStartSeconds: 124124,
                validStartNanos: 151515
            })
            .build()
            .sign(privateKey);

        const tx = transaction.toProto().toObject();
        expect(tx).toStrictEqual({
            body: undefined,
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeDoeCgIYBRCNARiQTiISThesearerandomparameters",
            sigmap: {
                sigpairList: [
                    {
                        contract: "",
                        ecdsa384: "",
                        ed25519: "IpjyHWtt1KSzFpVUBS1UVKpMUms8og/JCBtaYwwIgiAg7uD3eekGIVK40mYAGhHF7GbUfpqHeKdcgM9Fx+rbCQoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHg6HgoCGAUQjQEYkE4iEk4XrHmq3q2p3aJqWq2pnrXq7A==",
                        pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                        rsa3072: ""
                    }
                ]
            },
            sigs: undefined
        });
    });
});
