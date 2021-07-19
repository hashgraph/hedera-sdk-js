import {
    TokenCreateTransaction,
    TokenMintTransaction,
    Transaction,
    Hbar,
    Status,
} from "../src/exports.js";
import IntegrationTestEnv from "./client/index.js";

describe("TokenMint", function () {
    it("should be executable", async function () {
        this.timeout(60000);

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
            .setNodeAccountIds(env.nodeAccountIds)
            .setMaxTransactionFee(new Hbar(1000))
            .execute(env.client);

        const token = (await response.getReceipt(env.client)).tokenId;

        await (
            await new TokenMintTransaction()
                .setNodeAccountIds([response.nodeId])
                .setAmount(10)
                .setTokenId(token)
                .execute(env.client)
        ).getReceipt(env.client);
    });

    it("toBytes/fromBytes", async function () {
        this.timeout(60000);

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
            .setNodeAccountIds(env.nodeAccountIds)
            .setMaxTransactionFee(new Hbar(1000))
            .execute(env.client);

        const token = (await response.getReceipt(env.client)).tokenId;

        let mint = new TokenMintTransaction()
            .setNodeAccountIds([response.nodeId])
            .setAmount(10)
            .setTokenId(token)
            .freezeWith(env.client)

        let mintBytes = mint.toBytes()

        let mintFromBytes = Transaction.fromBytes(mintBytes)

        await (
            await mintFromBytes
                .execute(env.client)
        ).getReceipt(env.client);
    });

    it("should error when token ID is not set", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        let err = false;

        try {
            await (
                await new TokenMintTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setAmount(10)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidTokenId);
        }

        if (!err) {
            throw new Error("token Mint did not error");
        }
    });

    it("should error when amount is not set", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
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
                await new TokenMintTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenId(token)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidTokenMintAmount);
        }

        if (!err) {
            throw new Error("token mint did not error");
        }
    });
});
