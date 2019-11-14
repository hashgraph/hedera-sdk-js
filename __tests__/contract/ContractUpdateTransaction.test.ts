import { ContractUpdateTransaction } from "../../src/exports";
import { mockClient, privateKey } from "../MockClient";

describe("ContractUpdateTransaction", () => {
    it("serializes and deserializes correctly; ContractUpdateTransaction", () => {
        const transaction = new ContractUpdateTransaction(mockClient)
            .setContractId({ shard: 0, realm: 0, contract: 3 })
            .setAdminkey(privateKey.publicKey)
            .setFileId({ shard: 0, realm: 0, file: 5 })
            .setExpirationTime(new Date(1569375111277))
            .setProxyAccountId({ shard: 0, realm: 0, account: 3 })
            .setAutoRenewPeriod(60 * 60 * 24 * 14)
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
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeEpECgIYAxIMCIeHq+wFEMDeioQBGiISIODI7CdYpYef+sImoTwMUWt5nnLjUUGg3YKPlNN5iKS3MgIYAzoECIDqSUICGAU=",
            sigmap: undefined,
            sigs: undefined
        });
    });
});
