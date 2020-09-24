import TopicCreateTransaction from "../src/topic/TopicCreateTransaction";
import TopicInfoQuery from "../src/topic/TopicInfoQuery";
import TopicMessageQuery from "../src/topic/TopicMessageQuery";
import Hbar from "../src/Hbar";
import newClient from "./IntegrationClient";
import TopicDeleteTransaction from "../src/topic/TopicDeleteTransacton";
import TopicMessageSubmitTransaction from "../src/topic/TopicMessageSubmitTransaction";
import * as utf8 from "../src/encoding/utf8";

describe("TopicMessage", function () {
    it("should be executable", async function () {
        this.timeout(60000);

        const client = newClient();
        const operatorKey = client.getOperatorKey();

        let response = await new TopicCreateTransaction()
            .setAdminKey(operatorKey)
            .setTopicMemo("[e2e::TopicCreateTransaction]")
            .setMaxTransactionFee(new Hbar(5))
            .execute(client);

        let receipt = await response.getReceipt(client);

        expect(receipt.topicId).to.not.be.null;
        expect(receipt.topicId != null ? receipt.topicId.num > 0 : false).to.be
            .true;

        const topic = receipt.topicId;

        const info = await new TopicInfoQuery()
            .setNodeId(response.nodeId)
            .setTopicId(topic)
            .execute(client);

        expect(info.topicId.toString()).to.be.equal(topic.toString());
        expect(info.adminKey.toString()).to.be.equal(operatorKey.toString());

        await (
            await new TopicMessageSubmitTransaction()
                .setNodeId(response.nodeId)
                .setTopicId(topic)
                .setMessage("Hello from JS-SDK")
                .execute(client)
        ).getReceipt(client);

        let receivedMessage = false;

        const stop = Date.now() + 30 * 1000;

        const handle = new TopicMessageQuery()
            .setTopicId(topic)
            .subscribe(client, (message) => {
                receivedMessage =
                    utf8.decode(message.contents) === "Hello from JS-SDK";
            });

        while (!receivedMessage || Date.now() > stop) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        handle.unsubscribe();

        if (!receivedMessage) {
            throw new Error("Failed to receive message within 30 seconds");
        }

        await (
            await new TopicDeleteTransaction()
                .setTopicId(topic)
                .setNodeId(response.nodeId)
                .execute(client)
        ).getReceipt(client);
    });
});
