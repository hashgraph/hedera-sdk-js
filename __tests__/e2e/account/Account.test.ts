import {
    Ed25519PrivateKey,
    CryptoTransferTransaction,
    AccountBalanceQuery,
    AccountInfoQuery,
    AccountCreateTransaction,
    AccountDeleteTransaction,
    AccountUpdateTransaction,
    AccountRecordsQuery,
    Hbar,
    TransactionId
} from "../../../src/index-node";
import { getClientForIntegrationTest } from "../client-setup";

describe("AccountUpdateTransaction", () => {
    it("can be executed", async() => {
        const client = await getClientForIntegrationTest();

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

        for (const record of records) {
            expect(record.receipt).toBeDefined();
        }

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
            .addRecipient(client._getOperatorAccountId()!, new Hbar(1).asTinybar().dividedBy(10))
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
            .setTransferAccountId(client._getOperatorAccountId()!)
            .setMaxTransactionFee(new Hbar(1).asTinybar().dividedBy(2))
            .setTransactionId(new TransactionId(account))
            .build(client)
            .sign(key2)
            .execute(client);

        await transactionId.getReceipt(client);
    }, 60000);
});
