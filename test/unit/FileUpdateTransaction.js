import { FileUpdateTransaction } from "../../src/index.js";

describe("FileUpdateTransaction", function () {
    describe("deserialization of optional parameters", function () {
        it("should deserialize with fileMemo being null", function () {
            const tx = new FileUpdateTransaction();
            const tx2 = FileUpdateTransaction.fromBytes(tx.toBytes());

            expect(tx.fileMemo).to.be.null;
            expect(tx2.fileMemo).to.be.null;
        });
    });

    describe("clearFileMemo", function () {
        it("should send an empty memo wrapper when the memo is cleared", function () {
            const tx = new FileUpdateTransaction()
                .setFileMemo("old memo")
                .clearFileMemo();

            expect(tx.fileMemo).to.equal("");
            expect(tx._makeTransactionData().memo).to.deep.equal({
                value: "",
            });
        });

        it("should keep an explicitly empty memo through a bytes round trip", function () {
            const tx = new FileUpdateTransaction().clearFileMemo();
            const tx2 = FileUpdateTransaction.fromBytes(tx.toBytes());

            expect(tx2.fileMemo).to.equal("");
            expect(tx2._makeTransactionData().memo).to.deep.equal({
                value: "",
            });
        });

        it("should not send a memo wrapper when the memo was never set", function () {
            const tx = new FileUpdateTransaction();

            expect(tx._makeTransactionData().memo).to.be.null;
        });
    });
});
