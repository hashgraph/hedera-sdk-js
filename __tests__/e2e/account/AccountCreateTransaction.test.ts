import { Client, Ed25519PrivateKey, AccountCreateTransaction, Hbar } from "../../../src/index-node";

describe("AccountCreateTransaction", () => {
    it("can be executed", async () => {
        const operatorPrivateKey = process.env.OPERATOR_KEY;
        const operatorAccount = process.env.OPERATOR_ID;

        if (operatorPrivateKey == null || operatorAccount == null) {
            throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
        }

        const client = Client
            .forTestnet()
            .setOperator(operatorAccount, operatorPrivateKey);

        const transactionId = await new AccountCreateTransaction()
            .setKey((await Ed25519PrivateKey.generate()).publicKey)
            .setMaxTransactionFee(new Hbar(1))
            .setInitialBalance(0)
            .execute(client);

        const receipt = await transactionId.getReceipt(client);

        expect(receipt.getAccountId()).toBeDefined();
    }, 15000);
});
