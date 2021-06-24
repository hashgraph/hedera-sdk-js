import {
    TopicCreateTransaction,
    TopicDeleteTransaction,
    TopicMessageSubmitTransaction,
    TopicMessageQuery,
    Status,
} from "../src/exports.js";
import IntegrationTestEnv from "./client/index.js";
import { bigContents } from "./contents.js";

describe("TopicMessage", function () {
    it("should be executable", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;

        const response = await new TopicCreateTransaction()
            .setAdminKey(operatorKey)
            .setSubmitKey(operatorKey)
            .setNodeAccountIds(env.nodeAccountIds)
            .setAutoRenewAccountId(operatorId)
            .execute(env.client);

        const topic = (await response.getReceipt(env.client)).topicId;

        let finished = false;
        const contents = "Hello from Hedera SDK JS";

        const handle = new TopicMessageQuery()
            .setTopicId(topic)
            .setStartTime(0)
            .setLimit(1)
            .setCompletionHandler(() => {
                finished = true;
            })
            // eslint-disable-next-line no-unused-vars
            .subscribe(env.client, (_) => {
                console.log("here");
                // Do nothing
            });

        const startTime = Date.now();

        await (
            await new TopicMessageSubmitTransaction()
                .setTopicId(topic)
                .setMessage(contents)
                .execute(env.client)
        ).getReceipt(env.client);

        while (!finished && Date.now() < startTime + 45000) {
            await new Promise((resolved) => setTimeout(resolved, 2000));
        }

        await (
            await new TopicDeleteTransaction()
                .setTopicId(topic)
                .execute(env.client)
        ).getReceipt(env.client);

        handle.unsubscribe();

        if (!finished) {
            throw new Error("Failed to receive message in 30s");
        }
    });

    it("should be executable with large message", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;

        const response = await new TopicCreateTransaction()
            .setAdminKey(operatorKey)
            .setSubmitKey(operatorKey)
            .setNodeAccountIds(env.nodeAccountIds)
            .setAutoRenewAccountId(operatorId)
            .execute(env.client);

        const topic = (await response.getReceipt(env.client)).topicId;

        let finished = false;

        const handle = new TopicMessageQuery()
            .setTopicId(topic)
            .setStartTime(0)
            .setLimit(14)
            .setCompletionHandler(() => {
                finished = true;
            })
            // eslint-disable-next-line no-unused-vars
            .subscribe(env.client, (_) => {
                // Do nothing
            });

        const startTime = Date.now();

        await (
            await new TopicMessageSubmitTransaction()
                .setTopicId(topic)
                .setMessage(bigContents)
                .setMaxChunks(14)
                .execute(env.client)
        ).getReceipt(env.client);

        while (!finished && Date.now() < startTime + 45000) {
            await new Promise((resolved) => setTimeout(resolved, 2000));
        }

        await (
            await new TopicDeleteTransaction()
                .setTopicId(topic)
                .execute(env.client)
        ).getReceipt(env.client);

        handle.unsubscribe();

        if (!finished) {
            throw new Error("Failed to receive message in 45s");
        }
    });

    it("should error when topic ID is not set", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;

        const response = await new TopicCreateTransaction()
            .setAdminKey(operatorKey)
            .setSubmitKey(operatorKey)
            .setNodeAccountIds(env.nodeAccountIds)
            .setAutoRenewAccountId(operatorId)
            .execute(env.client);

        const topic = (await response.getReceipt(env.client)).topicId;

        const contents = "Hello from Hedera SDK JS";

        let err = false;

        try {
            await (
                await new TopicMessageSubmitTransaction()
                    .setMessage(contents)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidTopicId);
        }

        await (
            await new TopicDeleteTransaction()
                .setTopicId(topic)
                .execute(env.client)
        ).getReceipt(env.client);

        if (!err) {
            throw new Error("topic message did not error");
        }
    });

    it("should error when message is not set", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;

        const response = await new TopicCreateTransaction()
            .setAdminKey(operatorKey)
            .setSubmitKey(operatorKey)
            .setNodeAccountIds(env.nodeAccountIds)
            .setAutoRenewAccountId(operatorId)
            .execute(env.client);

        const topic = (await response.getReceipt(env.client)).topicId;

        let err = false;

        try {
            await (
                await new TopicMessageSubmitTransaction()
                    .setTopicId(topic)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidTopicMessage);
        }

        await (
            await new TopicDeleteTransaction()
                .setTopicId(topic)
                .execute(env.client)
        ).getReceipt(env.client);

        if (!err) {
            throw new Error("topic message did not error");
        }
    });
});
