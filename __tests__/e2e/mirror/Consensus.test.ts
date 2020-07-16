import {
    Hbar,
    ConsensusTopicCreateTransaction,
    ConsensusTopicDeleteTransaction,
    ConsensusTopicInfoQuery,
    ConsensusTopicUpdateTransaction,
    ConsensusMessageSubmitTransaction
} from "../../../src/index-node";
import { getClientForIntegrationTest } from "../client-setup";

describe("ConsensusMessageSubmitTransaction", () => {
    it("can be executed", async() => {
        const client = await getClientForIntegrationTest();

        let transactionId = await new ConsensusTopicCreateTransaction()
            .setAdminKey(client._getOperatorKey()!)
            .setTopicMemo("[e2e::ConsensusTopicCreateTransaction]")
            .setMaxTransactionFee(new Hbar(2))
            .execute(client);

        const receipt = await transactionId.getReceipt(client);

        const topic = receipt.getConsensusTopicId();

        let info = await new ConsensusTopicInfoQuery()
            .setTopicId(topic)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(info.topicMemo).toStrictEqual("[e2e::ConsensusTopicCreateTransaction]");
        expect(info.sequenceNumber).toBe(0);
        expect(info.adminKey!.toString()).toBe(client._getOperatorKey()!.toString());

        transactionId = await new ConsensusMessageSubmitTransaction()
            .setTopicId(topic)
            .setMessage("[e2e::ConsensusMessageSubmitTransaction]")
            .setMaxTransactionFee(new Hbar(1))
            .execute(client);
        
        await transactionId.getReceipt(client);

        info = await new ConsensusTopicInfoQuery()
            .setTopicId(topic)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(info.topicMemo).toStrictEqual("[e2e::ConsensusTopicCreateTransaction]");
        expect(info.sequenceNumber).toBe(1);
        expect(info.adminKey!.toString()).toBe(client._getOperatorKey()!.toString());

        transactionId = await new ConsensusTopicUpdateTransaction()
            .setTopicId(topic)
            .setTopicMemo("[e2e::ConsensusTopicUpdateTransaction]")
            .setMaxTransactionFee(new Hbar(1))
            .execute(client);

        await transactionId.getReceipt(client);

        info = await new ConsensusTopicInfoQuery()
            .setTopicId(topic)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(info.topicMemo).toStrictEqual("[e2e::ConsensusTopicUpdateTransaction]");
        expect(info.sequenceNumber).toBe(1);
        expect(info.adminKey!.toString()).toBe(client._getOperatorKey()!.toString());

        transactionId = await new ConsensusTopicDeleteTransaction()
            .setTopicId(topic)
            .setMaxTransactionFee(new Hbar(1))
            .execute(client);

        await transactionId.getReceipt(client);
    }, 60000);
});
