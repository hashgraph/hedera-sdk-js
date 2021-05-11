import {
    AccountCreateTransaction,
    AccountDeleteTransaction,
    AccountInfoQuery,
    Hbar,
    Status,
    TransactionId,
    TokenCreateTransaction,
    TokenAssociateTransaction,
    PrivateKey,
} from "../src/exports.js";
import IntegrationTestEnv from "./client/index.js";

describe("AccountInfo", function () {
    it("should be able to query cost", async function () {
        this.timeout(15000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;

        const cost = await new AccountInfoQuery()
            .setAccountId(operatorId)
            .setNodeAccountIds(env.nodeAccountIds)
            .getCost(env.client);

        expect(cost.toTinybars().toInt()).to.be.at.least(25);
    });

    it("should be executable", async function () {
        this.timeout(15000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key.publicKey)
            .setNodeAccountIds(env.nodeAccountIds)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        const info = await new AccountInfoQuery()
            .setNodeAccountIds([response.nodeId])
            .setAccountId(account)
            .execute(env.client);

        expect(info.accountId.toString()).to.be.equal(account.toString());
        expect(info.isDeleted).to.be.false;
        expect(info.key.toString()).to.be.equal(key.publicKey.toString());
        expect(info.balance.toTinybars().toInt()).to.be.equal(
            new Hbar(2).toTinybars().toInt()
        );
        expect(info.autoRenewPeriod.seconds.toNumber()).to.be.equal(7776000);
        expect(info.proxyAccountId).to.be.null;
        expect(info.proxyReceived.toTinybars().toInt()).to.be.equal(0);

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setNodeAccountIds([response.nodeId])
                    .setTransferAccountId(operatorId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(env.client)
                    .sign(key)
            ).execute(env.client)
        ).getReceipt(env.client);
    });

    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip("should be able to get 300 accounts", async function () {
        this.timeout(150000000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        const key = PrivateKey.generate();
        let response = [];
        let receipt = [];
        let info = [];

        for (let i = 0; i < 300; i++) {
            response[i] = await new AccountCreateTransaction()
                .setKey(key.publicKey)
                .setNodeAccountIds(env.nodeAccountIds)
                .setInitialBalance(new Hbar(2))
                .execute(env.client);
        }

        for (let i = 0; i < 300; i++) {
            receipt[i] = await response[i].getReceipt(env.client);
        }

        for (let i = 0; i < 300; i++) {
            info[i] = await new AccountInfoQuery()
                .setNodeAccountIds([response[i].nodeId])
                .setAccountId(receipt[i].accountId)
                .execute(env.client);

            console.log(info[i].accountId);
        }

        for (let i = 0; i < 300; i++) {
            await (
                await (
                    await new AccountDeleteTransaction()
                        .setAccountId(receipt[i].accountId)
                        .setNodeAccountIds([response[i].nodeId])
                        .setTransferAccountId(operatorId)
                        .setTransactionId(
                            TransactionId.generate(receipt[i].accountId)
                        )
                        .freezeWith(env.client)
                        .sign(key)
                ).execute(env.client)
            ).getReceipt(env.client);
        }
    });

    it("should reflect token with no keys", async function () {
        this.timeout(10000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        const key = PrivateKey.generate();

        let response = await new AccountCreateTransaction()
            .setKey(key)
            .setNodeAccountIds(env.nodeAccountIds)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        const account = (await response.getReceipt(env.client)).accountId;

        response = await new TokenCreateTransaction()
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setTreasuryAccountId(operatorId)
            .execute(env.client);

        const token = (await response.getReceipt(env.client)).tokenId;

        await (
            await (
                await new TokenAssociateTransaction()
                    .setTokenIds([token])
                    .setAccountId(account)
                    .freezeWith(env.client)
                    .sign(key)
            ).execute(env.client)
        ).getReceipt(env.client);

        const info = await new AccountInfoQuery()
            .setAccountId(account)
            .execute(env.client);

        const relationship = info.tokenRelationships.get(token);

        expect(relationship).to.be.not.null;
        expect(relationship.tokenId.toString()).to.be.equal(token.toString());
        expect(relationship.balance.toInt()).to.be.equal(0);
        expect(relationship.isKycGranted).to.be.null;
        expect(relationship.isFrozen).to.be.null;
    });

    it("should be error with no account ID", async function () {
        this.timeout(15000);

        const env = await IntegrationTestEnv.new();
        let err = false;

        try {
            await new AccountInfoQuery().execute(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidAccountId.toString());
        }

        if (!err) {
            throw new Error("query did not error");
        }
    });
});
