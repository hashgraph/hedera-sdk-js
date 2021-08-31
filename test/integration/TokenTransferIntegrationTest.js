import {
    AccountCreateTransaction,
    TokenAssociateTransaction,
    TokenGrantKycTransaction,
    TokenCreateTransaction,
    TokenWipeTransaction,
    TransferTransaction,
    Hbar,
    Status,
    PrivateKey,
} from "../src/exports.js";
import IntegrationTestEnv from "./client/index.js";

describe("TokenTransfer", function () {
    it("should be executable", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        const token = (
            await (
                await new TokenCreateTransaction()
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
                    .execute(env.client)
            ).getReceipt(env.client)
        ).tokenId;

        await (
            await (
                await new TokenAssociateTransaction()
                    .setTokenIds([token])
                    .setAccountId(account)
                    .freezeWith(env.client)
                    .sign(key)
            ).execute(env.client)
        ).getReceipt(env.client);

        await (
            await (
                await new TokenGrantKycTransaction()
                    .setTokenId(token)
                    .setAccountId(account)
                    .freezeWith(env.client)
                    .sign(key)
            ).execute(env.client)
        ).getReceipt(env.client);

        await (
            await new TransferTransaction()
                .addTokenTransfer(token, account, 10)
                .addTokenTransfer(token, env.operatorId, -10)
                .execute(env.client)
        ).getReceipt(env.client);

        await (
            await new TokenWipeTransaction()
                .setTokenId(token)
                .setAccountId(account)
                .setAmount(10)
                .execute(env.client)
        ).getReceipt(env.client);

        await env.close({ token });
    });

    it("should error when no amount is transferred", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        const token = (
            await (
                await new TokenCreateTransaction()
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setDecimals(3)
                    .setInitialSupply(10000000)
                    .setTreasuryAccountId(operatorId)
                    .setAdminKey(operatorKey)
                    .setKycKey(operatorKey)
                    .setFreezeKey(operatorKey)
                    .setWipeKey(operatorKey)
                    .setSupplyKey(operatorKey)
                    .setFreezeDefault(false)
                    .execute(env.client)
            ).getReceipt(env.client)
        ).tokenId;

        await (
            await (
                await new TokenAssociateTransaction()
                    .setTokenIds([token])
                    .setAccountId(account)
                    .freezeWith(env.client)
                    .sign(key)
            ).execute(env.client)
        ).getReceipt(env.client);

        await (
            await (
                await new TokenGrantKycTransaction()
                    .setTokenId(token)
                    .setAccountId(account)
                    .freezeWith(env.client)
                    .sign(key)
            ).execute(env.client)
        ).getReceipt(env.client);

        let err = false;

        try {
            await (
                await new TransferTransaction()
                    .addTokenTransfer(token, account, 0)
                    .addTokenTransfer(token, env.operatorId, 0)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidAccountAmounts);
        }

        if (!err) {
            throw new Error("Token transfer did not error.");
        }

        await env.close({ token });
    });

    it("should error when no  is transferred", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        const token = (
            await (
                await new TokenCreateTransaction()
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setDecimals(3)
                    .setInitialSupply(0)
                    .setTreasuryAccountId(operatorId)
                    .setAdminKey(operatorKey)
                    .setKycKey(operatorKey)
                    .setFreezeKey(operatorKey)
                    .setWipeKey(operatorKey)
                    .setSupplyKey(operatorKey)
                    .setFreezeDefault(false)
                    .execute(env.client)
            ).getReceipt(env.client)
        ).tokenId;

        await (
            await (
                await new TokenAssociateTransaction()
                    .setTokenIds([token])
                    .setAccountId(account)
                    .freezeWith(env.client)
                    .sign(key)
            ).execute(env.client)
        ).getReceipt(env.client);

        await (
            await (
                await new TokenGrantKycTransaction()
                    .setTokenId(token)
                    .setAccountId(account)
                    .freezeWith(env.client)
                    .sign(key)
            ).execute(env.client)
        ).getReceipt(env.client);

        let err = false;

        try {
            await (
                await new TransferTransaction()
                    .addTokenTransfer(token, account, 10)
                    .addTokenTransfer(token, env.operatorId, -10)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InsufficientTokenBalance);
        }

        if (!err) {
            throw new Error("Token transfer did not error.");
        }

        await env.close({ token });
    });
});
