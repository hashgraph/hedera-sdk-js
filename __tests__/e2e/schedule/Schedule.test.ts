import {
    AccountCreateTransaction,
    ScheduleCreateTransaction,
    ScheduleInfoQuery,
    ScheduleDeleteTransaction,
    ScheduleSignTransaction,
    ConsensusMessageSubmitTransaction,
    ConsensusTopicCreateTransaction,
    Ed25519PrivateKey,
    KeyList,
    Hbar, TransferTransaction
} from "../../../src/index-node";
import * as utf8 from "@stablelib/utf8";
import { getClientForIntegrationTest } from "../client-setup";
// import { ConsensusTopicCreateTransaction } from "../../../lib/consensus/ConsensusTopicCreateTransaction";

describe("ScheduleCreateTransaction", () => {
    it("can be executed", async() => {
        const client = await getClientForIntegrationTest();

        const key = await Ed25519PrivateKey.generate();

        const transaction = new AccountCreateTransaction()
            .setInitialBalance(new Hbar(10))
            .setKey(key.publicKey)
            .build(client);

        const scheduled = transaction.schedule()
            .setPayerAccountId(client._getOperatorAccountId()!)
            .setAdminKey(client._getOperatorKey()!);

        const transactionId = await scheduled
            .setMaxTransactionFee(new Hbar(15))
            .execute(client);

        const receipt = await transactionId.getReceipt(client);

        await new Promise((r) => setTimeout(r, 2500));

        const schedule = receipt.getScheduleId();

        const info = await new ScheduleInfoQuery()
            .setScheduleId(schedule)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        console.log(info.executionTime?.toDateString());
    }, 60000);

    it("can be executed with setTransaction", async() => {
        const client = await getClientForIntegrationTest();

        const key = await Ed25519PrivateKey.generate();

        const transaction = new AccountCreateTransaction()
            .setInitialBalance(new Hbar(10))
            .setKey(key.publicKey)
            .build(client);

        const scheduled = new ScheduleCreateTransaction()
            .setScheduledTransaction(transaction)
            .setPayerAccountId(client._getOperatorAccountId()!)
            .setAdminKey(client._getOperatorKey()!);

        const transactionId = await scheduled
            .setMaxTransactionFee(new Hbar(15))
            .execute(client);

        const receipt = await transactionId.getReceipt(client);

        await new Promise((r) => setTimeout(r, 2500));

        const schedule = receipt.getScheduleId();

        const info = await new ScheduleInfoQuery()
            .setScheduleId(schedule)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);
        console.log(info.getTransaction().toString());
        console.log(info.executionTime?.toDateString());
    }, 60000);

    it("schedule transaction can be signed", async() => {
        const client = await getClientForIntegrationTest();

        const key1 = await Ed25519PrivateKey.generate();
        // Submit Key
        const key2 = await Ed25519PrivateKey.generate();

        let transactionId = await new AccountCreateTransaction()
            .setInitialBalance(new Hbar(10))
            .setKey(key1.publicKey)
            .execute(client);

        let receipt = await transactionId.getReceipt(client);
        const accountId = receipt.getAccountId();

        const transaction = await new TransferTransaction()
            .addHbarTransfer(accountId, new Hbar(1)
                .asTinybar()
                .dividedBy(10)
                .negated())
            .addHbarTransfer(client._getOperatorAccountId()!, new Hbar(1).asTinybar().dividedBy(10))
            .setMaxTransactionFee(new Hbar(1).asTinybar().dividedBy(2))
            .build(client);

        const scheduled = transaction
            .schedule()
            .setPayerAccountId(accountId)
            .build(client);
        transactionId = await scheduled.execute(client);
        receipt = await transactionId.getReceipt(client);
        const scheduleId = receipt.getScheduleId();

        await (
            await (
                await new ScheduleSignTransaction()
                    .setScheduleId(scheduleId)
                    .build(client)
                    .sign(key1)
            ).execute(client)
        ).getReceipt(client);
    }, 60000);
});
