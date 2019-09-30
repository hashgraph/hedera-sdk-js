import { AccountCreateTransaction } from "../src/account/AccountCreateTransaction";
import { Transaction } from "../src/Transaction";
import { mockClient, privateKey } from "./MockClient";

describe("Transaction", () => {
    it("serializes and deserializes correctly", () => {
        const transaction = new AccountCreateTransaction(mockClient)
            .setKey(privateKey.publicKey)
            .setInitialBalance(1e3)
            .setTransactionFee(1e6)
            .build();

        const txnBytes = transaction.toBytes();

        const transaction2 = Transaction.fromBytes(mockClient, txnBytes);

        expect(transaction.toProto()).toStrictEqual(transaction2.toProto());
    });
});
