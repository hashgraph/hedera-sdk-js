import {
    AccountCreateTransaction,
    Hbar,
    KeyList,
    PrivateKey,
    ScheduleInfoQuery,
    ScheduleSignTransaction,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
    AccountBalanceQuery,
    ScheduleCreateTransaction,
    TransferTransaction,
} from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("ScheduleCreate", function () {
    let env;

    before(async function () {
        env = await IntegrationTestEnv.new();
    });

    it("should be executable", async function () {
        this.timeout(120000);
        const operatorKey = env.operatorKey.publicKey;
        const operatorId = env.operatorId;

        const key1 = PrivateKey.generateED25519();

        // Submit Key
        const key2 = PrivateKey.generateED25519();

        const key3 = PrivateKey.generateED25519();

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
    });

    it("should be able to query cost", async function () {
        this.timeout(120000);
        const operatorKey = env.operatorKey.publicKey;
        const operatorId = env.operatorId;

        const key1 = PrivateKey.generateED25519();

        // Submit Key
        const key2 = PrivateKey.generateED25519();

        const key3 = PrivateKey.generateED25519();

        const keyList = KeyList.of(
            key1.publicKey,
            key2.publicKey,
            key3.publicKey
        );

        const balance = await new AccountBalanceQuery()
            .setAccountId(operatorId)
            .execute(env.client);

        console.log(`Balances of the new account: ${balance.toString()}`);

        const response = await new AccountCreateTransaction()
            .setInitialBalance(new Hbar(10))
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

        const cost = await new ScheduleInfoQuery()
            .setScheduleId(scheduleId)
            .getCost(env.client);

        expect(cost.toTinybars().toInt()).to.be.at.least(1);
    });

    it("should be able to encode/decode scheduled transaction", async function () {
        this.timeout(120000);

        const tx = new TransferTransaction()
            .addHbarTransfer(env.operatorId, Hbar.fromTinybars(1))
            .addHbarTransfer("0.0.1023", Hbar.fromTinybars(1).negated());

        const scheduledTx = new ScheduleCreateTransaction()
            .setScheduledTransaction(tx)
            .freezeWith(env.client);

        const sch = scheduledTx._getScheduledTransactionBody();
        expect(sch.scheduleCreate.scheduledTransactionBody).not.to.be.null;

        const bytes = scheduledTx.toBytes();
        const tx2 = ScheduleCreateTransaction.fromBytes(bytes);

        const sch2 = tx2._getScheduledTransactionBody();
        expect(sch2.scheduleCreate.scheduledTransactionBody).not.to.be.null;
    });

    after(async function () {
        await env.close();
    });
});
