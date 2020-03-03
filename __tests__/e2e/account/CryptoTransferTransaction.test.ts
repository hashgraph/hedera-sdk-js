import { Client, Ed25519PrivateKey, CryptoTransferTransaction, TransactionId, Hbar } from "../../../src/index-node";

describe("CryptoTransferTransaction", () => {
    it("can be executed", async () => {
        if (process.env.OPERATOR_KEY == null || process.env.OPERATOR_ID == null) {
            throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
        }

        const operatorPrivateKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY);
        const operatorAccount = process.env.OPERATOR_ID;

        const client = Client
            .forTestnet()
            .setOperator(operatorAccount, operatorPrivateKey);

        const transactionId = await new CryptoTransferTransaction()
            .addSender(operatorAccount, 1)
            .addRecipient("0.0.3", 1)
            .setMaxTransactionFee(new Hbar(1))
            .execute(client);

        await transactionId.getReceipt(client);
    }, 15000);
});
