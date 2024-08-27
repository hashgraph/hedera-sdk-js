import { expect } from "chai";
import {
    AccountId,
    AirdropTokenTransaction,
    TokenId,
} from "../../src/index.js";
import TokenTransfer from "../../src/token/TokenTransfer.js";
import AccountAmount from "../../src/token/AccountAmount.js";

import TokenNftTransfer from "../../src/token/TokenNftTransfer.js";

describe("Transaction", function () {
    it("from | toBytes", async function () {
        const USER = new AccountId(0, 0, 100);
        const TOKEN_ID = new TokenId(0, 0, 1);
        const NFT_ID = 1;
        const IS_APPROVAL = true;
        const AMOUNT = 1000;

        let accountAmount = new AccountAmount()
            .setAccountId(USER)
            .setIsApproval(IS_APPROVAL)
            .setAmount(AMOUNT);

        let nftTransfer = new TokenNftTransfer({
            isApproved: true,
            receiverAccountId: USER,
            senderAccountId: USER,
            serialNumber: NFT_ID,
            tokenId: TOKEN_ID,
        });

        let tokenTransfer = new TokenTransfer()
            .setAccountAmounts([accountAmount])
            .setTokenNftTransfers([nftTransfer])
            .setTokenId(TOKEN_ID)
            .setExpectedDecimals(1);

        const transaction = new AirdropTokenTransaction().setTokenTransfers([
            tokenTransfer,
        ]);

        const txBytes = transaction.toBytes();
        const tx = AirdropTokenTransaction.fromBytes(txBytes);

        expect(tx.tokenTransfers[0].tokenId).to.deep.equal(TOKEN_ID);

        // token transfer tests
        expect(tx.tokenTransfers[0].expectedDecimals).to.equal(1);
        expect(tx.tokenTransfers[0].tokenId).to.deep.equal(TOKEN_ID);
        expect(tx.tokenTransfers.length).to.equal(1);

        // account amount tests
        expect(tx.tokenTransfers[0].accountAmounts[0].accountId).to.deep.equal(
            USER,
        );
        expect(
            tx.tokenTransfers[0].accountAmounts[0].amount.toInt(),
        ).to.deep.equal(accountAmount.amount);
        expect(tx.tokenTransfers[0].accountAmounts[0].isApproval).to.deep.equal(
            accountAmount.isApproval,
        );
        expect(tx.tokenTransfers[0].accountAmounts.length).to.equal(1);

        // nft transfer tests
        expect(tx.tokenTransfers[0].tokenNftTransfers[0].tokenId).to.deep.equal(
            TOKEN_ID,
        );
        expect(
            tx.tokenTransfers[0].tokenNftTransfers[0].senderAccountId,
        ).to.deep.equal(USER);
        expect(
            tx.tokenTransfers[0].tokenNftTransfers[0].receiverAccountId,
        ).to.deep.equal(USER);
        expect(
            tx.tokenTransfers[0].tokenNftTransfers[0].serialNumber.toInt(),
        ).to.deep.equal(NFT_ID);
        expect(
            tx.tokenTransfers[0].tokenNftTransfers[0].isApproved,
        ).to.deep.equal(IS_APPROVAL);
        expect(tx.tokenTransfers[0].tokenNftTransfers.length).to.equal(1);
    });

    describe("Token Transfer", function () {
        let tokenTransfer;

        beforeEach(function () {
            tokenTransfer = new TokenTransfer();
        });

        it("should set token transfer", function () {
            const ACCOUNT_AMOUNT = new AccountAmount();
            tokenTransfer.setAccountAmounts(ACCOUNT_AMOUNT);
            expect(tokenTransfer.accountAmounts).to.equal(ACCOUNT_AMOUNT);
        });

        it("should set expected decimals", function () {
            const EXPECTED_DECIMALS = 1;
            tokenTransfer.setExpectedDecimals(EXPECTED_DECIMALS);
            expect(tokenTransfer.expectedDecimals).to.equal(EXPECTED_DECIMALS);
        });

        it("should set token id", function () {
            const TOKEN_ID = new TokenId(0, 0, 1);
            tokenTransfer.setTokenId(TOKEN_ID);
        });

        it("should set token nft transfers", function () {
            const TOKEN_NFT_TRANSFER = new TokenNftTransfer({
                isApproved: true,
                receiverAccountId: new AccountId(0, 0, 100),
                senderAccountId: new AccountId(0, 0, 100),
                serialNumber: 1,
                tokenId: new TokenId(0, 0, 1),
            });
            tokenTransfer.setTokenNftTransfers([TOKEN_NFT_TRANSFER]);
            expect(tokenTransfer.tokenNftTransfers).to.deep.equal([
                TOKEN_NFT_TRANSFER,
            ]);
        });
    });

    describe("Account Amount", function () {
        let accountAmount;
        beforeEach(function () {
            accountAmount = new AccountAmount();
        });

        it("should set account id", function () {
            const ACCOUNT_ID = new AccountId(0, 0, 100);
            accountAmount.setAccountId(ACCOUNT_ID);
            expect(accountAmount.accountId).to.deep.equal(ACCOUNT_ID);
        });

        it("should set amount", function () {
            const AMOUNT = 1000;
            accountAmount.setAmount(AMOUNT);
            expect(accountAmount.amount).to.equal(AMOUNT);
        });

        it("should set is approval", function () {
            const IS_APPROVAL = true;
            accountAmount.setIsApproval(IS_APPROVAL);
            expect(accountAmount.isApproval).to.equal(IS_APPROVAL);
        });
    });
});
