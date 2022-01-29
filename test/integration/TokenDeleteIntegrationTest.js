import {
    TokenCreateTransaction,
    TokenDeleteTransaction,
    Status,
} from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("TokenDelete", function () {
    it("should be executable", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;

        const response = await new TokenCreateTransaction()
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setDecimals(3)
            .setInitialSupply(1000000)
            .setTreasuryAccountId(operatorId)
            .setAdminKey(operatorKey)
            .setKycKey(operatorKey)
            .setFreezeKey(operatorKey)
            .setWipeKey(operatorKey)
            .setSupplyKey(operatorKey)
            .setFreezeDefault(false)
            .execute(env.client);

        const tokenId = (await response.getReceipt(env.client)).tokenId;

        await (
            await new TokenDeleteTransaction()
                .setTokenId(tokenId)
                .execute(env.client)
        ).getReceipt(env.client);

        await env.close();
    });

    it("should error with no token ID set", async function () {
        this.timeout(120000);
        const env = await IntegrationTestEnv.new();

        let err = false;

        try {
            await (
                await new TokenDeleteTransaction().execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidTokenId);
        }

        if (!err) {
            throw new Error("token deletion did not error");
        }

        await env.close();
    });
});
