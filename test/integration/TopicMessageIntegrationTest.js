import {
    TopicCreateTransaction,
    TopicDeleteTransaction,
    TopicMessageSubmitTransaction,
    TopicMessageQuery,
    Status,
} from "../src/exports.js";
import * as utf8 from "../src/encoding/utf8.js";
import newClient from "./client/index.js";
import { bigContents } from "./contents.js";

describe("TopicMessage", function () {
    it("should be executable", async function () {
        this.timeout(40000);

        let client = await newClient();
        const operatorId = client.operatorAccountId;
        const operatorKey = client.operatorPublicKey;

        const response = await new TopicCreateTransaction()
            .setAdminKey(operatorKey)
            .setSubmitKey(operatorKey)
            .setAutoRenewAccountId(operatorId)
            .execute(client);

        const topic = (await response.getReceipt(client)).topicId;

        let received = false;
        const contents = "Hello from Hedera SDK JS";

        const handle = new TopicMessageQuery()
            .setTopicId(topic)
            .setStartTime(0)
            .subscribe(client, (message) => {
                received = utf8.decode(message.contents) === contents;
            });

        const startTime = Date.now();

        await (
            await new TopicMessageSubmitTransaction()
                .setTopicId(topic)
                .setMessage(contents)
                .execute(client)
        ).getReceipt(client);

        while (!received && Date.now() < startTime + 30000) {
            // Do nothing
        }

        await (
            await new TopicDeleteTransaction().setTopicId(topic).execute(client)
        ).getReceipt(client);

        handle.unsubscribe();

        if (!received) {
            throw new Error("Failed to receive message in 30s");
        }
    });

    it("should be executable with large message", async function () {
        this.timeout(60000);

        let client = await newClient();
        const operatorId = client.operatorAccountId;
        const operatorKey = client.operatorPublicKey;

        const response = await new TopicCreateTransaction()
            .setAdminKey(operatorKey)
            .setSubmitKey(operatorKey)
            .setAutoRenewAccountId(operatorId)
            .execute(client);

        const topic = (await response.getReceipt(client)).topicId;

        let received = false;

        const handle = new TopicMessageQuery()
            .setTopicId(topic)
            .setStartTime(0)
            .subscribe(client, (message) => {
                received = utf8.decode(message.contents) === bigContents;
            });

        const startTime = Date.now();

        await (
            await new TopicMessageSubmitTransaction()
                .setTopicId(topic)
                .setMessage(bigContents)
                .execute(client)
        ).getReceipt(client);

        while (!received && Date.now() < startTime + 45000) {
            // Do nothing
        }

        await (
            await new TopicDeleteTransaction().setTopicId(topic).execute(client)
        ).getReceipt(client);

        handle.unsubscribe();

        if (!received) {
            throw new Error("Failed to receive message in 45s");
        }
    });

    it("should error when topic ID is not set", async function () {
        this.timeout(40000);

        let client = await newClient();
        const operatorId = client.operatorAccountId;
        const operatorKey = client.operatorPublicKey;

        const response = await new TopicCreateTransaction()
            .setAdminKey(operatorKey)
            .setSubmitKey(operatorKey)
            .setAutoRenewAccountId(operatorId)
            .execute(client);

        const topic = (await response.getReceipt(client)).topicId;

        const contents = "Hello from Hedera SDK JS";

        let err = false;

        try {
            await (
                await new TopicMessageSubmitTransaction()
                    .setMessage(contents)
                    .execute(client)
            ).getReceipt(client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidTopicId);
        }

        await (
            await new TopicDeleteTransaction().setTopicId(topic).execute(client)
        ).getReceipt(client);

        if (!err) {
            throw new Error("topic message did not error");
        }
    });

    it("should error when topic ID is not set", async function () {
        this.timeout(40000);

        let client = await newClient();
        const operatorId = client.operatorAccountId;
        const operatorKey = client.operatorPublicKey;

        const response = await new TopicCreateTransaction()
            .setAdminKey(operatorKey)
            .setSubmitKey(operatorKey)
            .setAutoRenewAccountId(operatorId)
            .execute(client);

        const topic = (await response.getReceipt(client)).topicId;

        let err = false;

        try {
            await (
                await new TopicMessageSubmitTransaction()
                    .setTopicId(topic)
                    .execute(client)
            ).getReceipt(client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidTopicMessage);
        }

        await (
            await new TopicDeleteTransaction().setTopicId(topic).execute(client)
        ).getReceipt(client);

        if (!err) {
            throw new Error("topic message did not error");
        }
    });
});
