import {
    TopicCreateTransaction,
    TopicDeleteTransaction,
    Status,
} from "../src/exports.js";
import newClient from "./client/index.js";

describe("TopicDelete", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const client = await newClient();
        const operatorId = client.operatorAccountId;
        const operatorKey = client.operatorPublicKey;

        const response = await new TopicCreateTransaction()
            .setAdminKey(operatorKey)
            .setSubmitKey(operatorKey)
            .setAutoRenewAccountId(operatorId)
            .execute(client);

        const topic = (await response.getReceipt(client)).topicId;

        await (
            await new TopicDeleteTransaction()
                .setTopicId(topic)
                .execute(client)
        ).getReceipt(client);
    });

    it("should error when deleting immutable topic", async function () {
        this.timeout(10000);

        const client = await newClient();
        const response = await new TopicCreateTransaction().execute(client);
        const topic = (await response.getReceipt(client)).topicId;

        let err = false;

        try {
            await (
                await new TopicDeleteTransaction()
                    .setTopicId(topic)
                    .execute(client)
            ).getReceipt(client);
        } catch (error) {
            err = error.toString().includes(Status.Unauthorized);
        }

        if (!err) {
            throw new Error("topic deletion did not error");
        }
    });
});
