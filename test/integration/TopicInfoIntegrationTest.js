import {
    TopicCreateTransaction,
    TopicDeleteTransaction,
    TopicInfoQuery,
} from "../src/exports.js";
import newClient from "./client/index.js";

describe("TopicInfo", function () {
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

        const info = await new TopicInfoQuery()
            .setTopicId(topic)
            .setNodeAccountIds([response.nodeId])
            .execute(client);

        expect(info.topicId.toString()).to.eql(topic.toString());
        expect(info.topicMemo).to.eql("");
        expect(info.runningHash.length).to.be.eql(48);
        expect(info.sequenceNumber.toInt()).to.eql(0);
        expect(info.adminKey.toString()).to.eql(operatorKey.toString());
        expect(info.submitKey.toString()).to.eql(operatorKey.toString());
        expect(info.autoRenewAccountId.toString()).to.be.eql(
            operatorId.toString()
        );
        expect(info.autoRenewPeriod.seconds.toInt()).to.be.eql(7776000);
        expect(info.expirationTime).to.be.not.null;

        await (
            await new TopicDeleteTransaction().setTopicId(topic).execute(client)
        ).getReceipt(client);
    });

    it("should be executable when no fields are set", async function () {
        this.timeout(10000);

        const client = await newClient();

        const response = await new TopicCreateTransaction().execute(client);

        const topic = (await response.getReceipt(client)).topicId;

        const info = await new TopicInfoQuery()
            .setTopicId(topic)
            .setNodeAccountIds([response.nodeId])
            .execute(client);

        expect(info.topicId.toString()).to.eql(topic.toString());
        expect(info.topicMemo).to.eql("");
        expect(info.runningHash.length).to.be.eql(48);
        expect(info.sequenceNumber.toInt()).to.eql(0);
        expect(info.adminKey).to.be.null;
        expect(info.submitKey).to.be.null;
        expect(info.autoRenewAccountId).to.be.null;
        expect(info.autoRenewPeriod.seconds.toInt()).to.be.eql(7776000);
        expect(info.expirationTime).to.be.not.null;
    });
});
