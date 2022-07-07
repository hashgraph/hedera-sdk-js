import {
    AccountAllowanceDeleteTransaction,
    AccountId,
    Transaction,
    TransactionId,
    TokenId,
    NftId,
} from "../../src/index.js";
import Long from "long";

describe("AccountAllowanceDeleteTransaction", function () {
    it("[from|to]Bytes", async function () {
        const tokenId = TokenId.fromString("1.2.3");
        const serialNumber = Long.fromNumber(4);
        const operatorId = AccountId.fromString("5.6.7");
        const nftId = new NftId(tokenId, serialNumber);
        const transactionId = TransactionId.fromString(
            `${operatorId.toString()}@8.9`
        );
        const nodeAccountId = AccountId.fromString("10.11.12");
        const transaction = new AccountAllowanceDeleteTransaction()
            .setNodeAccountIds([nodeAccountId])
            .setTransactionId(transactionId)
            .deleteAllTokenNftAllowances(nftId, operatorId)
            .freeze();

        const bytes = transaction.toBytes();
        Transaction.fromBytes(bytes);
    });
});
