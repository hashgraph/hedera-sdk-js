import TransferTransaction from "../src/account/TransferTransaction.js";
import HbarUnit from "../src/HbarUnit.js";
import Hbar from "../src/Hbar.js";
import TokenId from "../src/token/TokenId.js";
import AccountId from "../src/account/AccountId.js";
import Transaction from "../src/transaction/Transaction.js";
import TransactionId from "../src/transaction/TransactionId.js";
import Timestamp from "../src/Timestamp.js";
import NftId from "../src/token/NftId.js";
import Long from "long";
import * as util from "../src/util.js";
import Long from "long";

describe("TransferTransaction", function () {
    const tokenId1 = new TokenId(1, 1, 1);
    const tokenId2 = new TokenId(2, 2, 2);
    const tokenId3 = new TokenId(3, 3, 3);
    const tokenId4 = new TokenId(4, 4, 4);
    const serialNum1 = 111111111;
    const accountId1 = new AccountId(1, 1, 1);
    const accountId2 = new AccountId(2, 2, 2);
    const accountId3 = new AccountId(3, 3, 3);
    const accountId4 = new AccountId(4, 4, 4);
    const timestamp1 = new Timestamp(4, 4);

    it("should combine multiple same accountId tansfers into one transfer", function () {
        const expectedHbar = 3;
        const accountId = "0.0.0";

        const transfer = new TransferTransaction()
            .addHbarTransfer(accountId, 1)
            .addHbarTransfer(accountId, 1);

        transfer.addHbarTransfer(accountId, 1);
        transfer.addHbarTransfer("0.0.1", 1);

        expect(
            transfer.hbarTransfers.get(accountId).to(HbarUnit.Hbar).toNumber()
        ).to.be.equal(new Hbar(expectedHbar).to(HbarUnit.Hbar).toNumber());
    });

    it("should load ntf transfers from bytes", function () {
        const transferTransaction = new TransferTransaction();
        transferTransaction.addNftTransfer(
            tokenId1,
            serialNum1,
            accountId1,
            accountId2
        );
        transferTransaction.addNftTransfer(
            tokenId1,
            serialNum1,
            accountId1,
            accountId2
        );
        transferTransaction.setTransactionId(
            new TransactionId(new AccountId(3, 3, 3), new Timestamp(4, 4))
        );
        transferTransaction.setNodeAccountIds([accountId4]);
        transferTransaction.freeze();

        const transferTransactionFromBytes = Transaction.fromBytes(
            transferTransaction.toBytes()
        );

        expect(transferTransaction.nftTransfers.keys()).to.eql(
            transferTransactionFromBytes.nftTransfers.keys()
        );
        expect(transferTransaction.nftTransfers.values()).to.eql(
            transferTransactionFromBytes.nftTransfers.values()
        );
    });

    it("should use nftid case for addNftTransfer", function () {
        let transferTransaction = new TransferTransaction();

        let tokenId = new TokenId(1, 2, 3);
        let serial = Long.fromString("1234567890");

        let nftId = new NftId(tokenId, serial);
        let sender = AccountId.fromString("1.1.1");
        let recipient = AccountId.fromString("2.2.2");

        let check = {
            serial: serial,
            sender: sender,
            recipient: recipient,
        };

        transferTransaction.addNftTransfer(nftId, sender, recipient);

        expect(
            transferTransaction.nftTransfers.values().next().value[0]
        ).to.eql(check);
        expect(transferTransaction.nftTransfers.keys().next().value).to.eql(
            tokenId
        );
    });

    it("should use tokenId/serial case for addNftTransfer", function () {
        let transferTransaction = new TransferTransaction();

        let tokenId = new TokenId(1, 2, 3);
        let serial = Long.fromString("1234567890");

        let sender = AccountId.fromString("1.1.1");
        let recipient = AccountId.fromString("2.2.2");

        let check = {
            serial: serial,
            sender: sender,
            recipient: recipient
        };

        transferTransaction.addNftTransfer(tokenId, serial, sender, recipient);

        expect(
            transferTransaction.nftTransfers.values().next().value[0]
        ).to.eql(check);
        expect(transferTransaction.nftTransfers.keys().next().value).to.eql(
            tokenId
        );
    });

    it("should throw error when undefined in addNftTransfer", function () {
        let transferTransaction = new TransferTransaction();

        let tokenId = new TokenId(1, 2, 3);
        let serial = Long.fromString("1234567890");

        let sender = AccountId.fromString("1.1.1");
        let recipient = undefined;

        try {
            transferTransaction.addNftTransfer(
                tokenId,
                serial,
                sender,
                recipient
            );
        } catch (error) {
            expect(error.message).to.eql(util.REQUIRE_NON_NULL_ERROR);
        }
    });

    it("should order transfers", function () {
        const transferTransaction = new TransferTransaction()
            // Insert in reverse order
            .addNftTransfer(tokenId4, serialNum1, accountId2, accountId4)
            .addNftTransfer(tokenId4, serialNum1, accountId1, accountId3)
            .addNftTransfer(tokenId3, serialNum1, accountId1, accountId2)
            .addTokenTransfer(tokenId2, accountId4, -1)
            .addTokenTransfer(tokenId2, accountId3, 2)
            .addTokenTransfer(tokenId1, accountId2, -3)
            .addTokenTransfer(tokenId1, accountId1, -4)
            .addHbarTransfer(accountId2, -1)
            .addHbarTransfer(accountId1, 1)
            .setTransactionId(new TransactionId(accountId3, timestamp1))
            .setNodeAccountIds([accountId4])
            .freeze();

        const data = transferTransaction._makeTransactionData();

        expect(data.transfers.accountAmounts).to.deep.equal([
            {
                accountID: {
                    shardNum: Long.fromNumber(1),
                    realmNum: Long.fromNumber(1),
                    accountNum: Long.fromNumber(1),
                },
                amount: Long.fromNumber(100000000),
            },
            {
                accountID: {
                    shardNum: Long.fromNumber(2),
                    realmNum: Long.fromNumber(2),
                    accountNum: Long.fromNumber(2),
                },
                amount: Long.fromNumber(-100000000),
            },
        ]);
        expect(data.tokenTransfers).to.deep.equal([
            {
                token: {
                    shardNum: Long.fromNumber(1),
                    realmNum: Long.fromNumber(1),
                    tokenNum: Long.fromNumber(1),
                },
                transfers: [
                    {
                        accountID: {
                            shardNum: Long.fromNumber(1),
                            realmNum: Long.fromNumber(1),
                            accountNum: Long.fromNumber(1),
                        },
                        amount: Long.fromNumber(-4),
                    },
                    {
                        accountID: {
                            shardNum: Long.fromNumber(2),
                            realmNum: Long.fromNumber(2),
                            accountNum: Long.fromNumber(2),
                        },
                        amount: Long.fromNumber(-3),
                    },
                ],
                nftTransfers: [],
            },
            {
                token: {
                    shardNum: Long.fromNumber(2),
                    realmNum: Long.fromNumber(2),
                    tokenNum: Long.fromNumber(2),
                },
                transfers: [
                    {
                        accountID: {
                            shardNum: Long.fromNumber(3),
                            realmNum: Long.fromNumber(3),
                            accountNum: Long.fromNumber(3),
                        },
                        amount: Long.fromNumber(2),
                    },
                    {
                        accountID: {
                            shardNum: Long.fromNumber(4),
                            realmNum: Long.fromNumber(4),
                            accountNum: Long.fromNumber(4),
                        },
                        amount: Long.fromNumber(-1),
                    },
                ],
                nftTransfers: [],
            },
            {
                token: {
                    shardNum: Long.fromNumber(3),
                    realmNum: Long.fromNumber(3),
                    tokenNum: Long.fromNumber(3),
                },
                transfers: [],
                nftTransfers: [
                    {
                        senderAccountID: {
                            shardNum: Long.fromNumber(1),
                            realmNum: Long.fromNumber(1),
                            accountNum: Long.fromNumber(1),
                        },
                        receiverAccountID: {
                            shardNum: Long.fromNumber(2),
                            realmNum: Long.fromNumber(2),
                            accountNum: Long.fromNumber(2),
                        },
                        serialNumber: Long.fromNumber(111111111),
                    },
                ],
            },
            {
                token: {
                    shardNum: Long.fromNumber(4),
                    realmNum: Long.fromNumber(4),
                    tokenNum: Long.fromNumber(4),
                },
                transfers: [],
                nftTransfers: [
                    {
                        senderAccountID: {
                            shardNum: Long.fromNumber(1),
                            realmNum: Long.fromNumber(1),
                            accountNum: Long.fromNumber(1),
                        },
                        receiverAccountID: {
                            shardNum: Long.fromNumber(3),
                            realmNum: Long.fromNumber(3),
                            accountNum: Long.fromNumber(3),
                        },
                        serialNumber: Long.fromNumber(111111111),
                    },
                    {
                        senderAccountID: {
                            shardNum: Long.fromNumber(2),
                            realmNum: Long.fromNumber(2),
                            accountNum: Long.fromNumber(2),
                        },
                        receiverAccountID: {
                            shardNum: Long.fromNumber(4),
                            realmNum: Long.fromNumber(4),
                            accountNum: Long.fromNumber(4),
                        },
                        serialNumber: Long.fromNumber(111111111),
                    },
                ],
            },
        ]);
    });
});
