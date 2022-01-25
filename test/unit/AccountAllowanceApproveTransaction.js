import { expect } from "chai";

import Long from "long";

import {
    AccountAllowanceApproveTransaction,
    AccountId,
    Hbar,
    NftId,
    Timestamp,
    TokenId,
    Transaction,
    TransactionId,
} from "../../src/exports.js";

describe("AccountAllowanceApproveTransaction", function () {
    it("should round trip from bytes and maintain order", function () {
        const tokenId1 = new TokenId(1);
        const tokenId2 = new TokenId(141);
        const serialNumber1 = Long.fromNumber(3);
        const serialNumber2 = Long.fromNumber(4);
        const nftId1 = new NftId(tokenId2, serialNumber1);
        const nftId2 = new NftId(tokenId2, serialNumber2);
        const spenderAccountId1 = new AccountId(7);
        const spenderAccountId2 = new AccountId(7890);
        const nodeAccountId = new AccountId(10, 11, 12);
        const timestamp1 = new Timestamp(14, 15);
        const hbarAmount = Hbar.fromTinybars(100);
        const tokenAmount = Long.fromNumber(101);

        let transaction = new AccountAllowanceApproveTransaction()
            .setTransactionId(
                TransactionId.withValidStart(spenderAccountId1, timestamp1)
            )
            .setNodeAccountIds([nodeAccountId])
            .addHbarAllowance(spenderAccountId1, hbarAmount)
            .addTokenAllowance(tokenId1, spenderAccountId1, tokenAmount)
            .addTokenNftAllowance(nftId1, spenderAccountId1)
            .addTokenNftAllowance(nftId2, spenderAccountId1)
            .addTokenNftAllowance(nftId2, spenderAccountId2)
            .addAllTokenNftAllowance(tokenId1, spenderAccountId1)
            .freeze();

        transaction = Transaction.fromBytes(transaction.toBytes());

        const data = transaction._makeTransactionData();

        expect(data).to.deep.equal({
            cryptoAllowances: [
                {
                    amount: hbarAmount.toTinybars(),
                    spender: spenderAccountId1._toProtobuf(),
                },
            ],
            nftAllowances: [
                {
                    serialNumbers: [serialNumber1, serialNumber2],
                    spender: spenderAccountId1._toProtobuf(),
                    tokenId: tokenId2._toProtobuf(),
                    approvedForAll: null,
                },
                {
                    serialNumbers: [serialNumber2],
                    spender: spenderAccountId2._toProtobuf(),
                    tokenId: tokenId2._toProtobuf(),
                    approvedForAll: null,
                },
                {
                    serialNumbers: null,
                    spender: spenderAccountId1._toProtobuf(),
                    tokenId: tokenId1._toProtobuf(),
                    approvedForAll: { value: true },
                },
            ],
            tokenAllowances: [
                {
                    amount: tokenAmount,
                    spender: spenderAccountId1._toProtobuf(),
                    tokenId: tokenId1._toProtobuf(),
                },
            ],
        });
    });
});
