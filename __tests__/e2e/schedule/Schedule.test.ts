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
    Hbar, TransferTransaction,
    AccountId, Ed25519PublicKey
} from "../../../src/index-node";
import * as utf8 from "@stablelib/utf8";
import { getClientForIntegrationTest } from "../client-setup";
// import { ConsensusTopicCreateTransaction } from "../../../lib/consensus/ConsensusTopicCreateTransaction";

describe("ScheduleCreateTransaction", () => {
    it("can be executed", async() => {
        const client = await getClientForIntegrationTest(false);

        const key = await Ed25519PrivateKey.generate();

        const key2 = await Ed25519PrivateKey.generate();

        const transactionId = await new AccountCreateTransaction()
            .setInitialBalance(new Hbar(10))
            .setKey(key.publicKey)
            .execute(client);
        const accountId = (await transactionId.getReceipt(client)).getAccountId();

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
                await new ScheduleSignTransaction()
                    .setScheduleId(scheduleId)
                    .build(client)
                    .sign(key2)
            ).execute(client)
        ).getReceipt(client);

        const info = await new ScheduleInfoQuery()
            .setScheduleId(scheduleId)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);
        console.log(info.getTransaction().toString());
        console.log(info.executionTime?.toDateString());
    }, 60000);

    it("can be executed with setTransaction", async() => {
        const client = await getClientForIntegrationTest(false);

        const key = await Ed25519PrivateKey.generate();

        const key2 = await Ed25519PrivateKey.generate();

        const transactionId = await new AccountCreateTransaction()
            .setInitialBalance(new Hbar(10))
            .setKey(key.publicKey)
            .execute(client);
        const accountId = (await transactionId.getReceipt(client)).getAccountId();

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
                await new ScheduleSignTransaction()
                    .setScheduleId(scheduleId)
                    .build(client)
                    .sign(key2)
            ).execute(client)
        ).getReceipt(client);

        const info = await new ScheduleInfoQuery()
            .setScheduleId(scheduleId)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);
        console.log(info.getTransaction().toString());
        console.log(info.executionTime?.toDateString());
    }, 60000);

    it("schedule transaction can be signed", async() => {
        const client = await getClientForIntegrationTest(false);

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
