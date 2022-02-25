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

        const receipt = new TransactionReceipt({
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
        });

        expect(
            TransactionReceipt.fromBytes(receipt.toBytes())._toProtobuf()
        ).to.deep.equal({
            receipt: {
                status: status._code,
                accountID: accountId._toProtobuf(),
                contractID: contractId._toProtobuf(),
                fileID: fileId._toProtobuf(),
                scheduleID: scheduleId._toProtobuf(),
                tokenID: tokenId._toProtobuf(),
                topicID: topicId._toProtobuf(),
                topicRunningHash,
                topicSequenceNumber,
                exchangeRate: {
                    currentRate: exchangeRate._toProtobuf(),
                    nextRate: null,
                },
                scheduledTransactionID: scheduledTransactionId._toProtobuf(),
                serialNumbers: serials,
                newTotalSupply: totalSupply,
            },
            duplicateTransactionReceipts: [],
            childTransactionReceipts: [],
        });
    });
});
