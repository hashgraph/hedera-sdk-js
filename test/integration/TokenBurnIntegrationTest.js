import { expect } from "chai";
import {
    Status,
    TokenBurnTransaction,
    TokenCreateTransaction,
    TokenSupplyType,
    TokenType,
    AccountBalanceQuery,
} from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("TokenBurn", function () {
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

        const token = (await response.getReceipt(env.client)).tokenId;

        await (
            await new TokenBurnTransaction()
                .setAmount(10)
                .setTokenId(token)
                .execute(env.client)
        ).getReceipt(env.client);

        await env.close({ token });
    });

    it("should error when token ID is not set", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();

        let err = false;

        try {
            await (
                await new TokenBurnTransaction()
                    .setAmount(10)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidTokenId);
        }

        if (!err) {
            throw new Error("token Burn did not error");
        }
    });

    it("should not error when amount is not set", async function () {
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

        const token = (await response.getReceipt(env.client)).tokenId;

        let err = false;

        try {
            await (
                await new TokenBurnTransaction()
                    .setTokenId(token)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error;
        }

        const accountBalance = await new AccountBalanceQuery()
            .setAccountId(operatorId)
            .execute(env.client);

        expect(
            accountBalance.tokens._map.get(token.toString()).toNumber()
        ).to.be.equal(1000000);

        if (err) {
            throw new Error("token burn did error");
        }

        await env.close({ token });
    });

    it("cannot burn token with invalid metadata", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;

        const response = await new TokenCreateTransaction()
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setTreasuryAccountId(operatorId)
            .setAdminKey(operatorKey)
            .setKycKey(operatorKey)
            .setFreezeKey(operatorKey)
            .setWipeKey(operatorKey)
            .setSupplyKey(operatorKey)
            .setFreezeDefault(false)
            .setMaxSupply(10)
            .setTokenType(TokenType.NonFungibleUnique)
            .setSupplyType(TokenSupplyType.Finite)
            .execute(env.client);

        const token = (await response.getReceipt(env.client)).tokenId;

        let err = false;

        try {
            await (
                await new TokenBurnTransaction()
                    .setTokenId(token)
                    .setAmount(1)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidTokenBurnMetadata);
        }

        if (!err) {
            throw new Error("token mint did not error");
        }

        await env.close({ token });
    });
});
