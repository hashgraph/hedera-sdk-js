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
            .build();

        const tx = transaction.toProto().toObject();
        expect(tx).toStrictEqual({
            body: undefined,
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeDoeCgIYBRCNARiQTiISThesearerandomparameters",
            sigmap: undefined,
            sigs: undefined
        });
    });
});
