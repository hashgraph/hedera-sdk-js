import {
    AccountId,
    Hbar,
    NodeDeleteTransaction,
    Timestamp,
    TransactionId,
} from "../../src/index.js";

describe("NodeCreateTransaction", function () {
    let tx;

    const TEST_VALID_START = new Timestamp(1596210382, 0);

    beforeEach(function () {
        const TEST_NODE_ID = 420;

        tx = new NodeDeleteTransaction()
            .setNodeAccountIds([
                AccountId.fromString("0.0.5005"),
                AccountId.fromString("0.0.5006"),
            ])
            .setTransactionId(
                TransactionId.withValidStart(
                    AccountId.fromString("0.0.5006"),
                    TEST_VALID_START,
                ),
            )
            .setNodeId(TEST_NODE_ID)
            .setMaxTransactionFee(new Hbar(1));
    });

    it("should convert from and to bytes", function () {
        const tx2 = NodeDeleteTransaction.fromBytes(tx.toBytes());
        tx.nodeAccountIds.forEach((element, index) => {
            expect(tx.nodeAccountIds[index].toString()).to.equal(
                tx2.nodeAccountIds[index].toString(),
            );
        });
        expect(tx.transactionId.toString()).to.equal(
            tx2.transactionId.toString(),
        );
    });

    it("should return node id", function () {
        expect(tx.nodeId).to.equal(420);
    });

    it("should set node id", function () {
        tx.setNodeId(421);
        expect(tx.nodeId).to.equal(421);
    });
});
