import TopicCreateTransaction from "../src/topic/TopicCreateTransaction";
import TopicInfoQuery from "../src/topic/TopicInfoQuery";
import Hbar from "../src/Hbar";
import newClient from "./IntegrationClient";
import Long from "long";

describe("FileUpdate", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const client = newClient();
        client.forTestnet();
        const operatorKey = client.getOperatorKey();

        let response = await new TopicCreateTransaction()
            .setKeys(operatorKey)
            .setContents("[e2e::FileCreateTransaction]")
            .setMaxTransactionFee(new Hbar(5))
            .execute(client);

        let receipt = await response.getReceipt(client);

        expect(receipt.fileId).to.not.be.null;
        expect(receipt.fileId != null ? receipt.fileId.num > 0 : false).to.be
            .true;

        const topic = receipt.topicId;

        let info = await new TopicInfoQuery()
            .setTopicId(topic)
            .setNodeId(response.nodeId)
            .setQueryPayment(new Hbar(22))
            .execute(client);

        expect(info.topicId).to.be.equal(topic);
        expect(info.topicMemo).to.be.equal("[e2e::TopicCreateTransaction]");
        expect(info.sequenceNumber).to.be.equal(Long.ZERO);
        expect(info.adminKey).to.be.equal(operatorKey);

        await (
            await new FileDeleteTransaction()
                .setFileId(file)
                .setNodeId(response.nodeId)
                .execute(client)
        ).getReceipt(client);
    });
});
