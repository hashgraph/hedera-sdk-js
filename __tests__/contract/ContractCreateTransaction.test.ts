import { ContractCreateTransaction } from "../../src/exports";
import { mockClient, privateKey } from "../MockClient";

describe("ContractCreateTransaction", () => {
    it("serializes and deserializes correctly; ContractCreateTransaction", () => {
        const transaction = new ContractCreateTransaction(mockClient)
            .setAdminkey(privateKey.publicKey)
            .setInitialBalance(1e3)
            .setBytecodeFile({ shard: 0, realm: 0, file: 4 })
            .setGas(100)
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
            bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeEI3CgIYBBoiEiDgyOwnWKWHn/rCJqE8DFFreZ5y41FBoN2Cj5TTeYiktyBkKOgHMgIYA0IECIDqSQ==",
            sigmap: undefined,
            sigs: undefined
        });
    });
});
