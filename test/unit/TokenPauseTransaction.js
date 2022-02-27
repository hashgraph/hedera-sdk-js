import {
    TokenUnpauseTransaction,
    TransactionId,
    AccountId,
    Timestamp,
} from "../../src/exports.js";
import Long from "long";

describe("TokenUnpauseTransaction", function () {
    it("encodes to correct protobuf", function () {
        const transaction = new TokenUnpauseTransaction()
            .setTransactionId(
                TransactionId.withValidStart(
                    new AccountId(1),
                    new Timestamp(2, 3)
                )
            )
            .setNodeAccountIds([new AccountId(4)])
            .setTokenId("0.0.5")
            .setTransactionMemo("random memo")
            .freeze();

        const protobuf = transaction._makeTransactionBody();

        expect(protobuf).to.deep.include({
            tokenUnpause: {
                token: {
                    tokenNum: Long.fromNumber(5),
                    shardNum: Long.fromNumber(0),
                    realmNum: Long.fromNumber(0),
                },
            },
            transactionFee: Long.fromNumber(200000000),
            memo: "random memo",
            transactionID: {
                accountID: {
                    accountNum: Long.fromNumber(1),
                    shardNum: Long.fromNumber(0),
                    realmNum: Long.fromNumber(0),
                    alias: null,
                },
                transactionValidStart: {
                    seconds: Long.fromNumber(2),
                    nanos: 3,
                },
                scheduled: false,
                nonce: null,
            },
            nodeAccountID: null,
            transactionValidDuration: {
                seconds: Long.fromNumber(120),
            },
        });
    });
});
