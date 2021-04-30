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
import newClient from "./client/index.js";

describe("ScheduleCreate", function () {
    it("should be executable", async function () {
        this.timeout(15000);
        const client = await newClient();
        const operatorKey = client.operatorPublicKey;
        const operatorId = client.operatorAccountId;

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
            .setInitialBalance(new Hbar(100))
            .setKey(keyList)
            .execute(client);

        expect((await response.getReceipt(client)).accountId).to.be.not.null;

        const topicId = (
            await (
                await new TopicCreateTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .setAdminKey(operatorKey)
                    .setAutoRenewAccountId(operatorId)
                    .setTopicMemo("HCS Topic_")
                    .setSubmitKey(key2)
                    .execute(client)
            ).getReceipt(client)
        ).topicId;

        const transaction = new TopicMessageSubmitTransaction()
            .setTopicId(topicId)
            .setMessage("scheduled hcs message");

        const scheduled = transaction
            .schedule()
            .setPayerAccountId(operatorId)
            .setAdminKey(operatorKey)
            .freezeWith(client);

        const transactionId = scheduled.transactionId;

        const scheduleId = (
            await (await scheduled.execute(client)).getReceipt(client)
        ).scheduleId;

        const info = await new ScheduleInfoQuery()
            .setScheduleId(scheduleId)
            .execute(client);

        const infoTransaction = /** @type {TopicMessageSubmitTransaction} */ (info.scheduledTransaction);

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
                    .freezeWith(client)
                    .sign(key2)
            ).execute(client)
        ).getReceipt(client);

        await new ScheduleInfoQuery().setScheduleId(scheduleId).execute(client);

        console.log(
            "https://previewnet.mirrornode.hedera.com/api/v1/transactions/" +
                transactionId.accountId.toString() +
                "-" +
                transactionId.validStart.seconds.toString() +
                "-" +
                transactionId.validStart.nanos.toString()
        );
    });
});
