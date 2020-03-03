import { Client, Ed25519PrivateKey, FileCreateTransaction, FileUpdateTransaction, FileAppendTransaction, FileDeleteTransaction, TransactionId, Hbar } from "../../../src/index-node";

describe("FileCreateTransaction", () => {
    it("can be executed", async () => {
        if (process.env.OPERATOR_KEY == null || process.env.OPERATOR_ID == null) {
            throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
        }

        const operatorPrivateKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY);
        const operatorAccount = process.env.OPERATOR_ID;

        const client = Client
            .forTestnet()
            .setOperator(operatorAccount, operatorPrivateKey);

        let transactionId = await new FileCreateTransaction()
            .addKey(operatorPrivateKey.publicKey)
            .setContents("[e2e::FileCreateTransaction]")
            .setMaxTransactionFee(new Hbar(5))
            .execute(client);

        let receipt = await transactionId.getReceipt(client);

        const file = receipt.getFileId();

        transactionId = await new FileAppendTransaction()
            .setFileId(file)
            .setContents("[e2e::FileAppendTransaction]")
            .setMaxTransactionFee(new Hbar(5))
            .execute(client);

        await transactionId.getReceipt(client);

        transactionId = await new FileDeleteTransaction()
            .setFileId(file)
            .setMaxTransactionFee(new Hbar(5))
            .execute(client);

        await transactionId.getReceipt(client);
    }, 30000);
});
