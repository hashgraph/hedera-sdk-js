import {
    TokenCreateTransaction,
    TokenBurnTransaction,
    Hbar,
    Status,
} from "../src/exports.js";
import newClient from "./client/index.js";

describe("TokenBurn", function () {
    it("should be executable", async function () {
        this.timeout(20000);

        const env = await newClient.new();
        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;

        const response = await new TokenCreateTransaction()
            .setNodeAccountIds(env.nodeAccountIds)
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
            .setMaxTransactionFee(new Hbar(1000))
            .execute(env.client);

        const token = (await response.getReceipt(env.client)).tokenId;

        await (
            await new TokenBurnTransaction()
                .setNodeAccountIds([response.nodeId])
                .setAmount(10)
                .setTokenId(token)
                .execute(env.client)
        ).getReceipt(env.client);
    });

    it("should error when token ID is not set", async function () {
        this.timeout(10000);

        const env = await newClient.new();

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

    it("should error when amount is not set", async function () {
        this.timeout(20000);

        const env = await newClient.new();
        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;

        const response = await new TokenCreateTransaction()
            .setNodeAccountIds(env.nodeAccountIds)
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
            .setMaxTransactionFee(new Hbar(1000))
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
            err = error.toString().includes(Status.InvalidTokenBurnAmount);
        }

        if (!err) {
            throw new Error("token burn did not error");
        }
    });
});
