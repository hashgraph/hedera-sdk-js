import { expect } from "chai";

import {
    FileAppendTransaction,
    AccountId,
    Timestamp,
    Hbar,
    TransactionId,
    FileId,
} from "../../src/index.js";
import Long from "long";
import * as symbols from "../../src/Symbols.js";

describe("FileAppendTransaction", function () {
    it("setChunkSize()", function () {
        const spenderAccountId1 = new AccountId(7);
        const fileId = new FileId(8);
        const nodeAccountId = new AccountId(10, 11, 12);
        const timestamp1 = new Timestamp(14, 15);
        const fee = new Hbar(5);

        let transaction = new FileAppendTransaction()
            .setTransactionId(
                TransactionId.withValidStart(spenderAccountId1, timestamp1)
            )
            .setNodeAccountIds([nodeAccountId])
            .setFileId(fileId)
            .setChunkSize(1000)
            .setContents("1".repeat(1000) + "2".repeat(1000) + "3".repeat(1000))
            .freeze();

        const transactionId = transaction.transactionId;
        // TOOD: fix `FileAppendTransaction.fromBytes()` it seems the transaction IDs
        // aren't be saved?
        //
        // transaction = /** @type {FileAppendTransaction} */ (
        //     Transaction.fromBytes(transaction.toBytes())
        // ).setChunkSize(1000);

        expect(transaction._transactionIds.list.length).to.be.equal(3);
        expect(transaction[symbols.nodeAccountIds].list.length).to.be.equal(1);

        let body = transaction[symbols.makeTransactionBody](nodeAccountId);

        expect(body.transactionID).to.deep.equal(transactionId[symbols.toProtobuf]());

        expect(body.transactionFee).to.deep.equal(fee.toTinybars());
        expect(body.memo).to.be.equal("");
        expect(body.transactionID).to.deep.equal(
            transaction._transactionIds.list[0][symbols.toProtobuf]()
        );
        expect(body.nodeAccountID).to.deep.equal(nodeAccountId[symbols.toProtobuf]());
        expect(body.transactionValidDuration).to.deep.equal({
            seconds: Long.fromNumber(120),
        });
        expect(body.fileAppend.fileID).to.deep.equal(fileId[symbols.toProtobuf]());
        expect(body.fileAppend.contents.length).to.be.equal(1000);
        expect(body.fileAppend.contents[0]).to.be.equal(49);

        transaction._transactionIds.advance();
        body = transaction[symbols.makeTransactionBody](nodeAccountId);

        expect(body.transactionFee).to.deep.equal(fee.toTinybars());
        expect(body.memo).to.be.equal("");
        expect(body.transactionID).to.deep.equal(
            transaction._transactionIds.list[1][symbols.toProtobuf]()
        );
        expect(body.nodeAccountID).to.deep.equal(nodeAccountId[symbols.toProtobuf]());
        expect(body.transactionValidDuration).to.deep.equal({
            seconds: Long.fromNumber(120),
        });
        expect(body.fileAppend.fileID).to.deep.equal(fileId[symbols.toProtobuf]());
        expect(body.fileAppend.contents.length).to.be.equal(1000);
        expect(body.fileAppend.contents[0]).to.be.equal(50);

        transaction._transactionIds.advance();
        body = transaction[symbols.makeTransactionBody](nodeAccountId);

        expect(body.transactionFee).to.deep.equal(fee.toTinybars());
        expect(body.memo).to.be.equal("");
        expect(body.transactionID).to.deep.equal(
            transaction._transactionIds.list[2][symbols.toProtobuf]()
        );
        expect(body.nodeAccountID).to.deep.equal(nodeAccountId[symbols.toProtobuf]());
        expect(body.transactionValidDuration).to.deep.equal({
            seconds: Long.fromNumber(120),
        });
        expect(body.fileAppend.fileID).to.deep.equal(fileId[symbols.toProtobuf]());
        expect(body.fileAppend.contents.length).to.be.equal(1000);
        expect(body.fileAppend.contents[0]).to.be.equal(51);
    });
});
