import {
    Status,
    AccountBalanceQuery,
    TokenCreateTransaction,
} from "../src/exports.js";
import IntegrationTestEnv from "./client/index.js";

describe("AccountBalanceQuery", function () {
    it("an account that does not exist should return an error", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        let err = false;

        try {
            await new AccountBalanceQuery()
                .setAccountId("1.0.3")
                .execute(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidAccountId.toString());
        }

        if (!err) {
            throw new Error("query did not error");
        }

        await env.close();
    });

    it("should reflect token with no keys", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new({ throwaway: true });
        const operatorId = env.operatorId;

        const token = (
            await (
                await new TokenCreateTransaction()
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(operatorId)
                    .execute(env.client)
            ).getReceipt(env.client)
        ).tokenId;

        const balances = await new AccountBalanceQuery()
            .setAccountId(env.operatorId)
            .execute(env.client);

        expect(balances.tokens.get(token).toInt()).to.be.equal(0);

        await env.close();
    });
});
