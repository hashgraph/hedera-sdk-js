import {
    PrivateKey,
    Hbar,
    Status,
    AccountBalanceQuery,
    AccountCreateTransaction,
    AccountDeleteTransaction,
    TokenCreateTransaction,
    TokenAssociateTransaction,
    TransactionId,
} from "../src/exports.js";
import IntegrationTestEnv from "./client/index.js";

describe("AccountBalanceQuery", function () {
    it("account 0.0.3 should have a balance higher than 1 tinybar", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const balance = await new AccountBalanceQuery()
            .setAccountId("3") // balance of node 3
            .setNodeAccountIds(env.nodeAccountIds)
            .execute(env.client);

        expect(balance.hbars.toTinybars().toNumber()).to.be.greaterThan(
            Hbar.fromTinybars(1).toTinybars().toNumber()
        );
    });

    it("an account that does not exist should return an error", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        let err = false;

        try {
            await new AccountBalanceQuery()
                .setAccountId("1.0.3")
                .setNodeAccountIds(env.nodeAccountIds)
                .execute(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidAccountId.toString());
        }

        if (!err) {
            throw new Error("query did not error");
        }
    });

    it("should reflect token with no keys", async function () {
        this.timeout(60000);

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

        const balances = await new AccountBalanceQuery()
            .setAccountId(account)
            .execute(env.client);

        expect(balances.tokens.get(token).toInt()).to.be.equal(0);

        env.close(env.client, key, env.nodeAccountIds, env.operatorId);

        // await (
        //     await (
        //         await new AccountDeleteTransaction()
        //             .setAccountId(account)
        //             .setNodeAccountIds([response.nodeId])
        //             .setTransferAccountId(operatorId)
        //             .setTransactionId(TransactionId.generate(account))
        //             .freezeWith(env.client)
        //             .sign(key)
        //     ).execute(env.client)
        // ).getReceipt(env.client);
        
    });
});
