import {
    AccountCreateTransaction,
    TokenAssociateTransaction,
    TokenCreateTransaction,
    Hbar,
    PrivateKey,
    TokenType,
    TokenMintTransaction,
    TransferTransaction,
    TokenNftInfoQuery,
    NftId,
    TokenGrantKycTransaction,
    TokenWipeTransaction,
    TokenBurnTransaction,
} from "../src/exports.js";
import IntegrationTestEnv from "./client/index.js";

describe("TokenNft", function () {
    it("should be able to transfer NFT", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const key = PrivateKey.generate();

        const account = (
            await (
                await new AccountCreateTransaction()
                    .setKey(key)
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const token = (
            await (
                await new TokenCreateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTokenType(TokenType.NonFungibleUnique)
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setKycKey(env.operatorKey)
                    .setFreezeKey(env.operatorKey)
                    .setWipeKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .setFreezeDefault(false)
                    .execute(env.client)
            ).getReceipt(env.client)
        ).tokenId;

        await (
            await (
                await new TokenAssociateTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenIds([token])
                    .setAccountId(account)
                    .freezeWith(env.client)
                    .sign(key)
            ).execute(env.client)
        ).getReceipt(env.client);

        await (
            await (
                await new TokenGrantKycTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenId(token)
                    .setAccountId(account)
                    .freezeWith(env.client)
                    .sign(key)
            ).execute(env.client)
        ).getReceipt(env.client);

        const serials = (
            await (
                await new TokenMintTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenId(token)
                    .addMetadata("NFT #1")
                    .addMetadata("NFT #2")
                    .execute(env.client)
            ).getReceipt(env.client)
        ).serials;

        const serial = serials[0];

        let info = await new TokenNftInfoQuery()
            .setNodeAccountIds(env.nodeAccountIds)
            .setNftId(new NftId(token, serial))
            .execute(env.client);

        expect(info[0].accountId.toString()).to.be.equal(
            env.operatorId.toString()
        );

        await (
            await new TransferTransaction()
                .setNodeAccountIds(env.nodeAccountIds)
                .addNftTransfer(token, serial, env.operatorId, account)
                .execute(env.client)
        ).getReceipt(env.client);

        info = await new TokenNftInfoQuery()
            .setNodeAccountIds(env.nodeAccountIds)
            .setNftId(new NftId(token, serial))
            .execute(env.client);

        expect(info[0].accountId.toString()).to.be.equal(account.toString());

        await (
            await new TokenWipeTransaction()
                .setNodeAccountIds(env.nodeAccountIds)
                .setTokenId(token)
                .setAccountId(account)
                .setSerials([serial])
                .execute(env.client)
        ).getReceipt(env.client);

        await (
            await new TokenBurnTransaction()
                .setNodeAccountIds(env.nodeAccountIds)
                .setTokenId(token)
                .setSerials([serials[1]])
                .execute(env.client)
        ).getReceipt(env.client);
    });
});
