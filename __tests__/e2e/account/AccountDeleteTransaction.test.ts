import { Client, Ed25519PrivateKey, AccountCreateTransaction, TransactionId, AccountDeleteTransaction, Hbar } from "../../../src/index-node";

describe("AccountDeleteTransaction", () => {
    it("can be executed", async () => {
        if (process.env.OPERATOR_KEY == null || process.env.OPERATOR_ID == null) {
            throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
        }

        const operatorPrivateKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY);
        const operatorAccount = process.env.OPERATOR_ID;

        const client = Client
            .forTestnet()
            .setOperator(operatorAccount, operatorPrivateKey);

        const key = await Ed25519PrivateKey.generate();

        let transactionId = await new AccountCreateTransaction()
            .setKey(key.publicKey)
            .setMaxTransactionFee(new Hbar(2))
            .setInitialBalance(new Hbar(1))
            .execute(client);

        let receipt = await transactionId.getReceipt(client);

        const accountId = receipt.getAccountId();

        transactionId = await new AccountDeleteTransaction()
            .setDeleteAccountId(accountId)
            .setTransferAccountId(operatorAccount)
            .setMaxTransactionFee(new Hbar(1))
            .setTransactionId(new TransactionId(accountId))
            .build(client)
            .sign(key)
            .execute(client);

        receipt = await transactionId.getReceipt(client);
    }, 30000);
});
