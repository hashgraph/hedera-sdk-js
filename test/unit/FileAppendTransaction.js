import { expect } from "chai";

import {
    FileAppendTransaction,
    AccountId,
    Timestamp,
    Transaction,
    TransactionId,
    FileId,
} from "../../src/exports.js";

describe("FileAppendTransaction", function () {
    it("setMaxChunkSize()", function () {
        const spenderAccountId1 = new AccountId(7);
        const fileId = new FileId(8);
        const nodeAccountId = new AccountId(10, 11, 12);
        const timestamp1 = new Timestamp(14, 15);

        let transaction = new FileAppendTransaction()
            .setTransactionId(
                TransactionId.withValidStart(spenderAccountId1, timestamp1)
            )
            .setNodeAccountIds([nodeAccountId])
            .setFileId(fileId)
            .setMaxChunkSize(1)
            .setContents("12345")
            .freeze();

        transaction = /** @type {FileAppendTransaction} */ (
            Transaction.fromBytes(transaction.toBytes())
        ).setMaxChunkSize(1);

        let data = transaction._makeTransactionData();
        transaction._startIndex++;

        expect(data).to.deep.equal({
            contents: new Uint8Array([49]),
            fileID: fileId._toProtobuf(),
        });

        data = transaction._makeTransactionData();
        transaction._startIndex++;

        expect(data).to.deep.equal({
            contents: new Uint8Array([50]),
            fileID: fileId._toProtobuf(),
        });

        data = transaction._makeTransactionData();
        transaction._startIndex++;

        expect(data).to.deep.equal({
            contents: new Uint8Array([51]),
            fileID: fileId._toProtobuf(),
        });

        data = transaction._makeTransactionData();
        transaction._startIndex++;

        expect(data).to.deep.equal({
            contents: new Uint8Array([52]),
            fileID: fileId._toProtobuf(),
        });

        data = transaction._makeTransactionData();
        transaction._startIndex++;

        expect(data).to.deep.equal({
            contents: new Uint8Array([53]),
            fileID: fileId._toProtobuf(),
        });
    });
});
