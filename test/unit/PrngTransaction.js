import {
    PrngTransaction,
    Transaction,
    AccountId,
    Timestamp,
    TransactionId,
} from "../../src/index.js";

describe("PrngTransaction", function () {
    it("should return range when create transaction from Bytes", async function () {
        const spenderAccountId = new AccountId(1);
        const timestamp = new Timestamp(14, 15);

        let transaction = await new PrngTransaction()
            .setTransactionId(
                TransactionId.withValidStart(spenderAccountId, timestamp)
            )
            .setNodeAccountIds([spenderAccountId])
            .setRange(100)
            .freeze();

        const transactionToBytes = transaction.toBytes();

        const transactionFromBytes = Transaction.fromBytes(transactionToBytes);

        expect(transactionFromBytes.range).to.eql(100);
    });
});
