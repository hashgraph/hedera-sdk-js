import {
    AccountCreateTransaction,
    ScheduleCreateTransaction,
    ScheduleInfoQuery,
    ScheduleSignTransaction,
    ConsensusMessageSubmitTransaction,
    ConsensusTopicCreateTransaction,
    Ed25519PrivateKey,
    Hbar, TransferTransaction,
} from "../../../src/index-node";
import { getClientForIntegrationTest } from "../client-setup";

describe("ScheduleCreateTransaction", () => {
    it("can be executed", async() => {
        const client = await getClientForIntegrationTest(false);

        const key2 = await Ed25519PrivateKey.generate();

        const topicId = (
            await (
                await new ConsensusTopicCreateTransaction()
                    .setAdminKey(client._getOperatorKey()!)
                    .setAutoRenewAccountId(client._getOperatorAccountId()!)
                    .setTopicMemo("HCS Topic_")
                    .setSubmitKey(key2.publicKey)
                    .execute(client)
            ).getReceipt(client)
        ).getConsensusTopicId();

        const transaction = new ConsensusMessageSubmitTransaction()
            .setTopicId(topicId)
            .setMessage("scheduled hcs message")
            .build(client);

        const scheduled = new ScheduleCreateTransaction()
            .setScheduledTransaction(transaction[ 0 ])
            .setPayerAccountId(client._getOperatorAccountId()!)
            .setAdminKey(client._getOperatorKey()!)
            .build(client);

        const scheduleId = (
            await (await scheduled.execute(client)).getReceipt(client)
        ).getScheduleId();

        await (
            await (
                new ScheduleSignTransaction()
                    .setScheduleId(scheduleId)
                    .build(client)
                    .sign(key2)
            ).execute(client)
        ).getReceipt(client);

        await new ScheduleInfoQuery()
            .setScheduleId(scheduleId)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);
    }, 60000);

    it("can be executed with setTransaction", async() => {
        const client = await getClientForIntegrationTest(false);

        const key2 = await Ed25519PrivateKey.generate();

        const topicId = (
            await (
                await new ConsensusTopicCreateTransaction()
                    .setAdminKey(client._getOperatorKey()!)
                    .setAutoRenewAccountId(client._getOperatorAccountId()!)
                    .setTopicMemo("HCS Topic_")
                    .setSubmitKey(key2.publicKey)
                    .execute(client)
            ).getReceipt(client)
        ).getConsensusTopicId();

        const transaction = new ConsensusMessageSubmitTransaction()
            .setTopicId(topicId)
            .setMessage("scheduled hcs message")
            .build(client);

        const scheduled = transaction[ 0 ]
            .schedule()
            .setPayerAccountId(client._getOperatorAccountId()!)
            .setAdminKey(client._getOperatorKey()!)
            .build(client);

        const scheduleId = (
            await (await scheduled.execute(client)).getReceipt(client)
        ).getScheduleId();

        await (
            await (
                new ScheduleSignTransaction()
                    .setScheduleId(scheduleId)
                    .build(client)
                    .sign(key2)
            ).execute(client)
        ).getReceipt(client);

        await new ScheduleInfoQuery()
            .setScheduleId(scheduleId)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);
    }, 60000);

    it("schedule transaction can be signed", async() => {
        const client = await getClientForIntegrationTest(false);

        const key1 = await Ed25519PrivateKey.generate();
        // Submit Key

        let transactionId = await new AccountCreateTransaction()
            .setInitialBalance(new Hbar(10))
            .setKey(key1.publicKey)
            .execute(client);

        let receipt = await transactionId.getReceipt(client);
        const accountId = receipt.getAccountId();

        const transaction = new TransferTransaction()
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
                new ScheduleSignTransaction()
                    .setScheduleId(scheduleId)
                    .build(client)
                    .sign(key1)
            ).execute(client)
        ).getReceipt(client);
    }, 60000);
});
