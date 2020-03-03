import { Client, Ed25519PrivateKey, AccountCreateTransaction, TransactionId, AccountDeleteTransaction, Hbar, AccountInfoQuery } from "../../../src/index-node";

describe("AccountInfoQuery", () => {
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

        const account = receipt.getAccountId();

        const info = await new AccountInfoQuery()
            .setAccountId(account)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(info.accountId).toStrictEqual(account);
        expect(info.isDeleted).toBe(false);
        expect(info.key.toString()).toBe(key.publicKey.toString());
        expect(info.balance.asTinybar().toString(10)).toBe(new Hbar(1).asTinybar().toString(10));

        transactionId = await new AccountDeleteTransaction()
            .setDeleteAccountId(account)
            .setTransferAccountId(operatorAccount)
            .setMaxTransactionFee(new Hbar(1))
            .setTransactionId(new TransactionId(account))
            .build(client)
            .sign(key)
            .execute(client);

        receipt = await transactionId.getReceipt(client);

        let errorThrown = false;
        try {
            await new AccountInfoQuery()
                .setAccountId(account)
                .setMaxQueryPayment(new Hbar(1))
                .execute(client);
        } catch {
            errorThrown = true;
        }

        expect(errorThrown).toBe(true);

    }, 30000);
});
