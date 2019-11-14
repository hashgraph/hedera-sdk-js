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
            sigmap: undefined,
            sigs: undefined
        });
    });
});
