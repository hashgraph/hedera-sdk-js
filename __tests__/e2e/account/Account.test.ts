import {
    Client,
    Ed25519PrivateKey,
    CryptoTransferTransaction,
    AccountBalanceQuery,
    AccountInfoQuery,
    AccountCreateTransaction,
    AccountDeleteTransaction,
    AccountUpdateTransaction,
    AccountRecordsQuery,
    AccountStakersQuery,
    Hbar,
    TransactionId
} from "../../../src/index-node";

describe("AccountUpdateTransaction", () => {
    it("can be executed", async () => {
        if (process.env.OPERATOR_KEY == null || process.env.OPERATOR_ID == null) {
            throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
        }

        const operatorPrivateKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY);
        const operatorAccount = process.env.OPERATOR_ID;

        const client = Client
            .forTestnet()
            .setOperator(operatorAccount, operatorPrivateKey);

        const key1 = await Ed25519PrivateKey.generate();
        const key2 = await Ed25519PrivateKey.generate();

        let transactionId = await new AccountCreateTransaction()
            .setKey(key1.publicKey)
            .setMaxTransactionFee(new Hbar(2))
            .setInitialBalance(new Hbar(1))
            .execute(client);

        const receipt = await transactionId.getReceipt(client);

        const account = receipt.getAccountId();

        let balance = await new AccountBalanceQuery()
            .setAccountId(account)
            .execute(client);

        expect(balance.asTinybar().toString(10)).toBe(new Hbar(1).asTinybar().toString(10));

        let info = await new AccountInfoQuery()
            .setAccountId(account)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(info.accountId).toStrictEqual(account);
        expect(info.isDeleted).toBe(false);
        expect(info.key.toString()).toBe(key1.publicKey.toString());
        expect(info.balance.asTinybar().toString(10)).toBe(new Hbar(1).asTinybar().toString(10));

        const records = await new AccountRecordsQuery()
            .setAccountId(account)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        for(const record of records) {
            expect(record.receipt).toBeDefined();
        }

        let errorThrown = false;
        try {
            // NOT-SUPPORTED
            await new AccountStakersQuery()
                .setAccountId(account)
                .setMaxQueryPayment(new Hbar(1))
                .execute(client);
        } catch {
            errorThrown = true;
        }

        expect(errorThrown).toBe(true);

        transactionId = await new AccountUpdateTransaction()
            .setAccountId(account)
            .setKey(key2.publicKey)
            .setMaxTransactionFee(new Hbar(1))
            .build(client)
            .sign(key1)
            .sign(key2)
            .execute(client);

        await transactionId.getReceipt(client);

        info = await new AccountInfoQuery()
            .setAccountId(account)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(info.accountId).toStrictEqual(account);
        expect(info.isDeleted).toBe(false);
        expect(info.key.toString()).toBe(key2.publicKey.toString());
        expect(info.balance.asTinybar().toString(10)).toBe(new Hbar(1).asTinybar().toString(10));

        transactionId = await new CryptoTransferTransaction()
            .addSender(account, new Hbar(1).asTinybar().dividedBy(10))
            .addRecipient(operatorAccount, new Hbar(1).asTinybar().dividedBy(10))
            .setMaxTransactionFee(new Hbar(1).asTinybar().dividedBy(2))
            .build(client)
            .sign(key2)
            .execute(client);

        await transactionId.getReceipt(client);

        balance = await new AccountBalanceQuery()
            .setAccountId(account)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(balance.asTinybar().isLessThan(new Hbar(1).asTinybar())).toBe(true);

        transactionId = await new AccountDeleteTransaction()
            .setDeleteAccountId(account)
            .setTransferAccountId(operatorAccount)
            .setMaxTransactionFee(new Hbar(1).asTinybar().dividedBy(2))
            .setTransactionId(new TransactionId(account))
            .build(client)
            .sign(key2)
            .execute(client);

        await transactionId.getReceipt(client);

        errorThrown = false;
        try {
            await new AccountInfoQuery()
                .setAccountId(account)
                .setMaxQueryPayment(new Hbar(1))
                .execute(client);
        } catch {
            errorThrown = true;
        }

        expect(errorThrown).toBe(true);
    }, 60000);
});
