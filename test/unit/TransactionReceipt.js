import { expect } from "chai";

import {
    AccountId,
    ContractId,
    ExchangeRate,
    FileId,
    ScheduleId,
    Status,
    Timestamp,
    TokenId,
    TopicId,
    TransactionId,
    TransactionReceipt,
} from "../../src/exports.js";
import Long from "long";

describe("TransactionReceipt", function () {
    it("[from|to]Bytes()", function () {
        const status = Status.Ok;
        const accountId = AccountId.fromString("0.0.1");
        const fileId = FileId.fromString("0.0.2");
        const contractId = ContractId.fromString("0.0.3");
        const topicId = TopicId.fromString("0.0.3");
        const tokenId = TokenId.fromString("0.0.4");
        const scheduleId = ScheduleId.fromString("0.0.5");
        const exchangeRate = new ExchangeRate({
            hbars: 6,
            cents: 7,
            expirationTime: new Date(8),
        });
        const topicSequenceNumber = Long.fromNumber(9);
        const topicRunningHash = new Uint8Array([10]);
        const totalSupply = Long.fromNumber(11);
        const scheduledTransactionId = TransactionId.withValidStart(
            AccountId.fromString("0.0.12"),
            new Timestamp(13, 14)
        );
        const serials = [Long.fromNumber(15)];

        const receipt = TransactionReceipt.fromBytes(
            new TransactionReceipt({
                status,
                accountId,
                fileId,
                contractId,
                topicId,
                tokenId,
                scheduleId,
                exchangeRate,
                topicSequenceNumber,
                topicRunningHash,
                totalSupply,
                scheduledTransactionId,
                serials,
                duplicates: [],
                children: [],
            }).toBytes()
        )._toProtobuf();

        expect(receipt.receipt.status).to.deep.equal(status._code);
        expect(receipt.receipt.accountID).to.deep.equal(
            accountId._toProtobuf()
        );
        expect(receipt.receipt.contractID).to.deep.equal(
            contractId._toProtobuf()
        );
        expect(receipt.receipt.fileID).to.deep.equal(fileId._toProtobuf());
        expect(receipt.receipt.scheduleID).to.deep.equal(
            scheduleId._toProtobuf()
        );
        expect(receipt.receipt.tokenID).to.deep.equal(tokenId._toProtobuf());
        expect(receipt.receipt.topicID).to.deep.equal(topicId._toProtobuf());
        expect(receipt.receipt.topicRunningHash).to.deep.equal(
            topicRunningHash
        );
        expect(receipt.receipt.topicSequenceNumber).to.deep.equal(
            topicSequenceNumber
        );
        expect(receipt.receipt.exchangeRate).to.deep.equal({
            currentRate: exchangeRate._toProtobuf(),
            nextRate: null,
        });
        expect(receipt.receipt.scheduledTransactionID).to.deep.equal(
            scheduledTransactionId._toProtobuf()
        );
        expect(receipt.receipt.serialNumbers).to.deep.equal(serials);
        expect(receipt.receipt.newTotalSupply).to.deep.equal(totalSupply);
        expect(receipt.duplicateTransactionReceipts).to.deep.equal([]);
        expect(receipt.childTransactionReceipts).to.deep.equal([]);
    });
});
