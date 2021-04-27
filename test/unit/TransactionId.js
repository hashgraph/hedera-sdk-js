import TransactionId from "../src/transaction/TransactionId.js";

describe("TransactionId", function () {
    it("should parse {shard}.{realm}.{num}@{seconds}.{nanos}", function () {
        const transactionId = TransactionId.fromString("1.2.3@4.5");

        expect(transactionId.toString()).to.be.equal("1.2.3@4.5");
    });

    it("should parse {num}@{seconds}.{nanos}", function () {
        const transactionId = TransactionId.fromString("3@4.5");

        expect(transactionId.toString()).to.be.equal("0.0.3@4.5");
    });

    it("should parse {shard}.{realm}.{num}@{seconds}.{nanos}?scheduled", function () {
        const transactionId = TransactionId.fromString("1.2.3@4.5?scheduled");

        expect(transactionId.toString()).to.be.equal("1.2.3@4.5?scheduled");
    });

    it("should parse {num}@{seconds}.{nanos}?scheduled", function () {
        const transactionId = TransactionId.fromString("3@4.5?scheduled");

        expect(transactionId.toString()).to.be.equal("0.0.3@4.5?scheduled");
    });
});
