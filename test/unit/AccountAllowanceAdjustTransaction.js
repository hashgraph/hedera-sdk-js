import { expect } from "chai";

import Long from "long";

import {
    AccountAllowanceAdjustTransaction,
    AccountId,
    Hbar,
    NftId,
    Timestamp,
    TokenId,
    Transaction,
    TransactionId,
} from "../../src/index.js";

describe("AccountAllowanceAdjustTransaction", function () {
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
        const ownerAccountId = new AccountId(20);

        let transaction = new AccountAllowanceAdjustTransaction()
            .setTransactionId(
                TransactionId.withValidStart(spenderAccountId1, timestamp1)
            )
            .setNodeAccountIds([nodeAccountId])
            .grantHbarAllowance(ownerAccountId, spenderAccountId1, hbarAmount)
            .grantTokenAllowance(
                tokenId1,
                ownerAccountId,
                spenderAccountId1,
                tokenAmount
            )
            .grantTokenNftAllowance(nftId1, ownerAccountId, spenderAccountId1)
            .grantTokenNftAllowance(nftId2, ownerAccountId, spenderAccountId1)
            .grantTokenNftAllowance(nftId2, ownerAccountId, spenderAccountId2)
            .grantTokenNftAllowanceAllSerials(
                tokenId1,
                ownerAccountId,
                spenderAccountId1
            )
            .freeze();

        transaction = Transaction.fromBytes(transaction.toBytes());

        const data = transaction._makeTransactionData();

        expect(data).to.deep.equal({
            cryptoAllowances: [
                {
                    owner: ownerAccountId._toProtobuf(),
                    amount: hbarAmount.toTinybars(),
                    spender: spenderAccountId1._toProtobuf(),
                },
            ],
            nftAllowances: [
                {
                    owner: ownerAccountId._toProtobuf(),
                    serialNumbers: [serialNumber1, serialNumber2],
                    spender: spenderAccountId1._toProtobuf(),
                    tokenId: tokenId2._toProtobuf(),
                    approvedForAll: null,
                },
                {
                    owner: ownerAccountId._toProtobuf(),
                    serialNumbers: [serialNumber2],
                    spender: spenderAccountId2._toProtobuf(),
                    tokenId: tokenId2._toProtobuf(),
                    approvedForAll: null,
                },
                {
                    owner: ownerAccountId._toProtobuf(),
                    serialNumbers: null,
                    spender: spenderAccountId1._toProtobuf(),
                    tokenId: tokenId1._toProtobuf(),
                    approvedForAll: { value: true },
                },
            ],
            tokenAllowances: [
                {
                    owner: ownerAccountId._toProtobuf(),
                    amount: tokenAmount,
                    spender: spenderAccountId1._toProtobuf(),
                    tokenId: tokenId1._toProtobuf(),
                },
            ],
        });
    });
});
