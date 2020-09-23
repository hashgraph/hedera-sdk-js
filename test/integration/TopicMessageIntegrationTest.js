import TopicCreateTransaction from "../src/topic/TopicCreateTransaction";
import TopicInfoQuery from "../src/topic/TopicInfoQuery";
import Hbar from "../src/Hbar";
import newClient from "./IntegrationClient";
import TopicDeleteTransaction from "../src/topic/TopicDeleteTransacton";

describe("TopicMessage", function () {
    it("should be executable", async function () {
        this.timeout(10000);

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

        await new TopicInfoQuery()
            .setTopicId(topic)
            .setNodeId(response.nodeId)
            .setQueryPayment(new Hbar(22))
            .execute(client);

        await (
            await new TopicDeleteTransaction()
                .setTopicId(topic)
                .setNodeId(response.nodeId)
                .execute(client)
        ).getReceipt(client);
    });
});
