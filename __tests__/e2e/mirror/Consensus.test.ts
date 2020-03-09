import {
    Client,
    Ed25519PrivateKey,
    Hbar,
    ConsensusTopicCreateTransaction,
    ConsensusTopicDeleteTransaction,
    ConsensusTopicInfoQuery,
    ConsensusTopicUpdateTransaction,
    ConsensusSubmitMessageTransaction,
    ConsensusMessageSubmitTransaction
} from "../../../src/index-node";

describe("AccountUpdateTransaction", () => {
    it("can be executed", async () => {
        if (process.env.OPERATOR_KEY == null || process.env.OPERATOR_ID == null) {
            throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
        }

        const operatorPrivateKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY);
        const operatorAccount = process.env.OPERATOR_ID;

        const client = Client
            .forTestnet()
            .setOperator(operatorAccount, operatorPrivateKey);

        let transactionId = await new ConsensusTopicCreateTransaction()
            .setAdminKey(operatorPrivateKey.publicKey)
            .setTopicMemo("[e2e::ConsensusTopicCreateTransaction]")
            .setMaxTransactionFee(new Hbar(1))
            .execute(client);

        const receipt = await transactionId.getReceipt(client);

        const topic = receipt.getConsensusTopicId();

        let info = await new ConsensusTopicInfoQuery()
            .setTopicId(topic)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(info.topicMemo).toStrictEqual("[e2e::ConsensusTopicCreateTransaction]");
        expect(info.sequenceNumber).toBe(0);
        expect(info.adminKey!.toString()).toBe(operatorPrivateKey.publicKey.toString());

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
        expect(info.adminKey!.toString()).toBe(operatorPrivateKey.publicKey.toString());

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
        expect(info.adminKey!.toString()).toBe(operatorPrivateKey.publicKey.toString());

        transactionId = await new ConsensusTopicDeleteTransaction()
            .setTopicId(topic)
            .setMaxTransactionFee(new Hbar(1))
            .execute(client);

        await transactionId.getReceipt(client);

        let errorThrown = false;
        try {
            await new ConsensusTopicInfoQuery()
                .setTopicId(topic)
                .setMaxQueryPayment(new Hbar(1))
                .execute(client);
        } catch {
            errorThrown = true;
        }

        expect(errorThrown).toBe(true);
    }, 60000);
});
