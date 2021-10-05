import {
    AccountCreateTransaction,
    ScheduleSignTransaction,
    ScheduleInfoQuery,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
    PrivateKey,
    Hbar,
    KeyList,
} from "../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("ScheduleCreate", function () {
    it("should be executable", async function () {
        this.timeout(60000);
        const env = await IntegrationTestEnv.new();
        const operatorKey = env.operatorKey.publicKey;
        const operatorId = env.operatorId;

        const key1 = PrivateKey.generate();

        // Submit Key
        const key2 = PrivateKey.generate();

        const key3 = PrivateKey.generate();

        const keyList = KeyList.of(
            key1.publicKey,
            key2.publicKey,
            key3.publicKey
        );

        const response = await new AccountCreateTransaction()
            .setInitialBalance(new Hbar(50))
            .setKey(keyList)
            .execute(env.client);

        expect((await response.getReceipt(env.client)).accountId).to.be.not
            .null;

        const topicId = (
            await (
                await new TopicCreateTransaction()
                    .setAdminKey(operatorKey)
                    .setAutoRenewAccountId(operatorId)
                    .setTopicMemo("HCS Topic_")
                    .setSubmitKey(key2)
                    .execute(env.client)
            ).getReceipt(env.client)
        ).topicId;

        const transaction = new TopicMessageSubmitTransaction()
            .setTopicId(topicId)
            .setMessage("scheduled hcs message");

        const scheduled = transaction
            .schedule()
            .setPayerAccountId(operatorId)
            .setAdminKey(operatorKey)
            .freezeWith(env.client);

        const scheduleId = (
            await (await scheduled.execute(env.client)).getReceipt(env.client)
        ).scheduleId;

        const info = await new ScheduleInfoQuery()
            .setScheduleId(scheduleId)
            .execute(env.client);

        const infoTransaction = /** @type {TopicMessageSubmitTransaction} */ (
            info.scheduledTransaction
        );

        // TODO: Remove when `ScheduleInfo.scheduledTransaction` works without serializing to bytes
        transaction.topicId._checksum = null;

        expect(info.scheduleId.toString()).to.be.equal(scheduleId.toString());
        expect(infoTransaction.topicId.toString()).to.be.equal(
            transaction.topicId.toString()
        );
        expect(infoTransaction.message.length).to.be.equal(
            transaction.message.length
        );
        expect(infoTransaction.nodeAccountIds).to.be.null;

        await (
            await (
                await new ScheduleSignTransaction()
                    .setScheduleId(scheduleId)
                    .freezeWith(env.client)
                    .sign(key2)
            ).execute(env.client)
        ).getReceipt(env.client);

        await new ScheduleInfoQuery()
            .setScheduleId(scheduleId)
            .execute(env.client);

        await env.close();
    });
});
