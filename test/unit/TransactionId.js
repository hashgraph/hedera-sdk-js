import { expect } from "chai";

import { TransactionId, AccountId, Timestamp } from "../../src/exports.js";

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

    it("should construct with nonce", function () {
        const accountId = AccountId.fromString("1.1.1");
        const validStart = new Timestamp(5, 4);
        const nonce = 117;
        const transactionId = new TransactionId(
            accountId,
            validStart,
            true,
            nonce
        );

        expect(transactionId.toString().includes("/117")).to.be.true;
    });

    it("should construct with scheduled without nonce", function () {
        const accountId = AccountId.fromString("1.1.1");
        const validStart = new Timestamp(5, 4);
        let transactionId = new TransactionId(accountId, validStart, true);

        expect(transactionId.toString()).to.equal("1.1.1@5.4?scheduled");

        transactionId = new TransactionId(accountId, validStart, true, null);

        expect(transactionId.toString()).to.equal("1.1.1@5.4?scheduled");

        transactionId = new TransactionId(
            accountId,
            validStart,
            true,
            undefined
        );

        expect(transactionId.toString()).to.equal("1.1.1@5.4?scheduled");
    });

    it("should construct with nonce without scheduled", function () {
        const accountId = AccountId.fromString("1.1.1");
        const validStart = new Timestamp(5, 4);
        const nonce = 117;
        let transactionId = new TransactionId(
            accountId,
            validStart,
            null,
            nonce
        );

        expect(transactionId.toString()).to.equal("1.1.1@5.4/117");

        transactionId = new TransactionId(accountId, validStart, NaN, nonce);

        expect(transactionId.toString()).to.equal("1.1.1@5.4/117");

        transactionId = new TransactionId(
            accountId,
            validStart,
            undefined,
            nonce
        );

        expect(transactionId.toString()).to.equal("1.1.1@5.4/117");
    });

    it("should construct without scheduled and nonce", function () {
        const accountId = AccountId.fromString("1.1.1");
        const validStart = new Timestamp(5, 4);
        let transactionId = new TransactionId(
            accountId,
            validStart,
            null,
            null
        );

        expect(transactionId.toString()).to.equal("1.1.1@5.4");

        transactionId = new TransactionId(
            accountId,
            validStart,
            undefined,
            undefined
        );

        expect(transactionId.toString()).to.equal("1.1.1@5.4");
    });

    it("should construct fromString", function () {
        let stringId = "1.1.1@5.4?scheduled/117";
        let transactionId = TransactionId.fromString(stringId).toString();

        expect(transactionId).to.eql(stringId);
    });

    it("should construct fromString without nonce", function () {
        let stringId = "1.1.1@5.4?scheduled";
        let transactionId = TransactionId.fromString(stringId).toString();

        expect(transactionId).to.eql(stringId);
    });

    it("should construct fromString without scheduled", function () {
        let stringId = "1.1.1@5.4/117";
        let transactionId = TransactionId.fromString(stringId).toString();

        expect(transactionId).to.eql(stringId);
    });

    it("should construct fromString without nonce and scheduled", function () {
        let stringId = "1.1.1@5.4";
        let transactionId = TransactionId.fromString(stringId).toString();

        expect(transactionId).to.eql(stringId);
    });
});
