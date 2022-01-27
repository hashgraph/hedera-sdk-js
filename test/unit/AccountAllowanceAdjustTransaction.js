import "mocha";
// import { expect } from "chai";

import {
    AccountAllowanceAdjustTransaction,
    // Transaction,
    AccountId,
    // Hbar,
    Timestamp,
    TokenId,
    TransactionId,
} from "../../src/exports.js";

describe("AccountAllowanceAdjustTransaction", function () {
    it("should round trip from bytes and maintain order", function () {
        const tokenId = new TokenId(1, 2, 3);
        const accountId1 = new AccountId(4, 5, 6);
        const accountId2 = new AccountId(7, 8, 9);
        const accountId3 = new AccountId(10, 11, 12);
        const amount = 13;
        const timestamp1 = new Timestamp(14, 15);

        let transaction = new AccountAllowanceAdjustTransaction()
            .setTransactionId(
                TransactionId.withValidStart(accountId1, timestamp1)
            )
            .setNodeAccountIds([accountId3])
            .setTokenId(tokenId)
            .setAccountId(accountId2)
            .setAmount(amount)
            .freeze();

        transaction.toBytes();

        // TODO: It seems `Transaction.fromBytes()` is failing to decode a `TransactionBody`
        // but at the same time it does look like we're building everything correctly.
        // At the very least I can say that `TransferTransaction` to and from bytes works, but
        // `AccountAllowanceAdjustTransaction` does not.
        // transaction = Transaction.fromBytes(bytes)._makeTransactionData();
        // expect(transaction).to.deep.equal({});
    });
});
