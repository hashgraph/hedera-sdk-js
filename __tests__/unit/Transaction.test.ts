import { AccountCreateTransaction } from "../../src/account/AccountCreateTransaction";
import { Transaction } from "../../src/Transaction";
import { mockClient, privateKey } from "./MockClient";

describe("Transaction", () => {
    it("serializes and deserializes correctly", () => {
        const transaction = new AccountCreateTransaction()
            .setKey(privateKey.publicKey)
            .setInitialBalance(1e3)
            .build(mockClient);

        const txnBytes = transaction.toBytes();

        const transaction2 = Transaction.fromBytes(txnBytes);

        expect(transaction._toProto()).toStrictEqual(transaction2._toProto());
    });
});
