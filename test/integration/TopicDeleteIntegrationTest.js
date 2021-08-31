import {
    TopicCreateTransaction,
    TopicDeleteTransaction,
    Status,
} from "../src/exports.js";
import IntegrationTestEnv from "./client/index.js";

describe("TopicDelete", function () {
    it("should be executable", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;

        const response = await new TopicCreateTransaction()
            .setAdminKey(operatorKey)
            .setSubmitKey(operatorKey)
            .setAutoRenewAccountId(operatorId)
            .execute(env.client);

        const topic = (await response.getReceipt(env.client)).topicId;

        await (
            await new TopicDeleteTransaction()
                .setTopicId(topic)
                .execute(env.client)
        ).getReceipt(env.client);

        await env.close();
    });

    it("should error when deleting immutable topic", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const response = await new TopicCreateTransaction().execute(env.client);
        const topic = (await response.getReceipt(env.client)).topicId;

        let err = false;

        try {
            await (
                await new TopicDeleteTransaction()
                    .setTopicId(topic)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.Unauthorized);
        }

        if (!err) {
            throw new Error("topic deletion did not error");
        }

        await env.close();
    });
});
