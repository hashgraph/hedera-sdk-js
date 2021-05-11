import {
    TopicCreateTransaction,
    TopicDeleteTransaction,
    Status,
} from "../src/exports.js";
import newClient from "./client/index.js";

describe("TopicDelete", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const env = await newClient.new();
        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;

        const response = await new TopicCreateTransaction()
            .setAdminKey(operatorKey)
            .setSubmitKey(operatorKey)
            .setNodeAccountIds(env.nodeAccountIds)
            .setAutoRenewAccountId(operatorId)
            .execute(env.client);

        const topic = (await response.getReceipt(env.client)).topicId;

        await (
            await new TopicDeleteTransaction()
                .setTopicId(topic)
                .execute(env.client)
        ).getReceipt(env.client);
    });

    it("should error when deleting immutable topic", async function () {
        this.timeout(10000);

        const env = await newClient.new();
        const response = await new TopicCreateTransaction().execute(
            env.client
        );
        const topic = (await response.getReceipt(env.client)).topicId;

        let err = false;

        try {
            await (
                await new TopicDeleteTransaction()
                    .setTopicId(topic)
                    .setNodeAccountIds(env.nodeAccountIds)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.Unauthorized);
        }

        if (!err) {
            throw new Error("topic deletion did not error");
        }
    });
});
