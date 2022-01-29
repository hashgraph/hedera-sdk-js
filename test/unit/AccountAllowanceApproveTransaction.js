import "mocha";
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
        const serialNumber = Long.fromNumber(3);
        const nftId = new NftId(tokenId2, serialNumber);
        const spenderAccountId = new AccountId(4);
        const nodeAccountId = new AccountId(10, 11, 12);
        const timestamp1 = new Timestamp(14, 15);
        const hbarAmount = Hbar.fromTinybars(100);
        const tokenAmount = Long.fromNumber(101);

        let transaction = new AccountAllowanceApproveTransaction()
            .setTransactionId(
                TransactionId.withValidStart(spenderAccountId, timestamp1)
            )
            .setNodeAccountIds([nodeAccountId])
            .addHbarAllowance(spenderAccountId, hbarAmount)
            .addTokenAllowance(tokenId1, spenderAccountId, tokenAmount)
            .addTokenNftAllowance(nftId, spenderAccountId)
            .addAllTokenNftAllowance(tokenId1, spenderAccountId)
            .freeze();

        transaction = Transaction.fromBytes(transaction.toBytes());

        const data = transaction._makeTransactionData();

        expect(data).to.deep.equal({
            cryptoAllowances: [
                {
                    amount: hbarAmount.toTinybars(),
                    spender: spenderAccountId._toProtobuf(),
                },
            ],
            nftAllowances: [
                {
                    serialNumbers: [serialNumber],
                    spender: spenderAccountId._toProtobuf(),
                    tokenId: tokenId2._toProtobuf(),
                    approvedForAll: null,
                },
                {
                    serialNumbers: null,
                    spender: spenderAccountId._toProtobuf(),
                    tokenId: tokenId1._toProtobuf(),
                    approvedForAll: { value: true },
                },
            ],
            tokenAllowances: [
                {
                    amount: tokenAmount,
                    spender: spenderAccountId._toProtobuf(),
                    tokenId: tokenId1._toProtobuf(),
                },
            ],
        });
    });
});
