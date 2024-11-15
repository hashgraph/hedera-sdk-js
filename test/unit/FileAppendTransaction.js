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

describe("FileAppendTransaction", function () {
    const spenderAccountId1 = new AccountId(7);
    const fileId = new FileId(8);
    const nodeAccountId = new AccountId(10, 11, 12);
    const timestamp1 = new Timestamp(14, 15);
    const fee = new Hbar(5);
    const chunkSize = 1000;

    it("setChunkSize()", function () {
        const contents = "1".repeat(1000) + "2".repeat(1000) + "3".repeat(1000);

        let transaction = new FileAppendTransaction()
            .setTransactionId(
                TransactionId.withValidStart(spenderAccountId1, timestamp1),
            )
            .setNodeAccountIds([nodeAccountId])
            .setFileId(fileId)
            .setChunkSize(chunkSize)
            .setContents(contents)
            .freeze();

        const transactionId = transaction.transactionId;
        // TOOD: fix `FileAppendTransaction.fromBytes()` it seems the transaction IDs
        // aren't be saved?
        //
        // transaction = /** @type {FileAppendTransaction} */ (
        //     Transaction.fromBytes(transaction.toBytes())
        // ).setChunkSize(1000);

        expect(transaction._transactionIds.list.length).to.be.equal(3);
        expect(transaction._nodeAccountIds.list.length).to.be.equal(1);

        let body = transaction._makeTransactionBody(nodeAccountId);

        expect(body.transactionID).to.deep.equal(transactionId._toProtobuf());

        expect(body.transactionFee).to.deep.equal(fee.toTinybars());
        expect(body.memo).to.be.equal("");
        expect(body.transactionID).to.deep.equal(
            transaction._transactionIds.list[0]._toProtobuf(),
        );
        expect(body.nodeAccountID).to.deep.equal(nodeAccountId._toProtobuf());
        expect(body.transactionValidDuration).to.deep.equal({
            seconds: Long.fromNumber(120),
        });
        expect(body.fileAppend.fileID).to.deep.equal(fileId._toProtobuf());
        expect(body.fileAppend.contents.length).to.be.equal(1000);
        expect(body.fileAppend.contents[0]).to.be.equal(49);

        transaction._transactionIds.advance();
        body = transaction._makeTransactionBody(nodeAccountId);

        expect(body.transactionFee).to.deep.equal(fee.toTinybars());
        expect(body.memo).to.be.equal("");
        expect(body.transactionID).to.deep.equal(
            transaction._transactionIds.list[1]._toProtobuf(),
        );
        expect(body.nodeAccountID).to.deep.equal(nodeAccountId._toProtobuf());
        expect(body.transactionValidDuration).to.deep.equal({
            seconds: Long.fromNumber(120),
        });
        expect(body.fileAppend.fileID).to.deep.equal(fileId._toProtobuf());
        expect(body.fileAppend.contents.length).to.be.equal(1000);
        expect(body.fileAppend.contents[0]).to.be.equal(50);

        transaction._transactionIds.advance();
        body = transaction._makeTransactionBody(nodeAccountId);

        expect(body.transactionFee).to.deep.equal(fee.toTinybars());
        expect(body.memo).to.be.equal("");
        expect(body.transactionID).to.deep.equal(
            transaction._transactionIds.list[2]._toProtobuf(),
        );
        expect(body.nodeAccountID).to.deep.equal(nodeAccountId._toProtobuf());
        expect(body.transactionValidDuration).to.deep.equal({
            seconds: Long.fromNumber(120),
        });
        expect(body.fileAppend.fileID).to.deep.equal(fileId._toProtobuf());
        expect(body.fileAppend.contents.length).to.be.equal(1000);
        expect(body.fileAppend.contents[0]).to.be.equal(51);
    });

    it("setChunkInterval()", function () {
        const contents = "1".repeat(1000) + "2".repeat(1000) + "3".repeat(1000);
        const chunkInterval = 200;

        let transaction = new FileAppendTransaction()
            .setTransactionId(
                TransactionId.withValidStart(spenderAccountId1, timestamp1),
            )
            .setNodeAccountIds([nodeAccountId])
            .setFileId(fileId)
            .setChunkSize(chunkSize)
            .setContents(contents)
            .setChunkInterval(chunkInterval)
            .freeze();

        expect(transaction._transactionIds.list.length).to.be.equal(3);
        const requiredChunks = contents.length / chunkSize;

        let body = transaction._makeTransactionBody(nodeAccountId);

        expect(body.transactionID).to.deep.equal(
            transaction._transactionIds.list[0]._toProtobuf(),
        );

        for (let i = 1; i < requiredChunks; i++) {
            transaction._transactionIds.advance();
            body = transaction._makeTransactionBody(nodeAccountId);
            expect(body.transactionID).to.deep.equal(
                transaction._transactionIds.list[i]._toProtobuf(),
            );

            expect(
                transaction._transactionIds.list[i].validStart.nanos.sub(
                    transaction._transactionIds.list[i - 1].validStart.nanos,
                ),
            ).to.deep.equal(Long.fromNumber(chunkInterval));
        }

        expect(
            transaction._transactionIds.list[
                requiredChunks - 1
            ].validStart.nanos.sub(
                transaction._transactionIds.list[0].validStart.nanos,
            ),
        ).to.deep.equal(Long.fromNumber(chunkInterval * (requiredChunks - 1)));
    });
});
