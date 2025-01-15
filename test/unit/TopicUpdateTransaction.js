import { TopicUpdateTransaction } from "../../src/index.js";

describe("TopicUpdateTransaction", function () {
    describe("deserialization of optional parameters", function () {
        it("should deserialize with topicMemo being null", function () {
            const tx = new TopicUpdateTransaction();
            const tx2 = TopicUpdateTransaction.fromBytes(tx.toBytes());

            expect(tx.topicMemo).to.be.null;
            expect(tx2.topicMemo).to.be.null;
        });
    });
});
