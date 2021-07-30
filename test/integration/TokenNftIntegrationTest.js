import {
    Status,
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

// eslint-disable-next-line mocha/no-skipped-tests
describe.skip("TokenNft", function () {
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
                    .addMetadata("0x01")
                    .addMetadata("0x02")
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

    it("Cannot burn NFTs when NFT is not owned by treasury", async function () {
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
                    .addMetadata("0x01")
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

        let err = false;

        try {
            await (
                await new TokenBurnTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenId(token)
                    .setSerials([serials[0]])
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.TreasuryMustOwnBurnedNft);
        }

        expect(err).to.be.true;
    });

    it("Cannot mint NFTs if metadata too big", async function () {
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

        let err = false;

        try {
            await (
                await new TokenMintTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenId(token)
                    .addMetadata("0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.MetadataTooLong);
        }

        expect(err).to.be.true;
    });

    it("Cannot query NFT info by invalid NftId", async function () {
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

        await (
            await new TokenMintTransaction()
                .setNodeAccountIds(env.nodeAccountIds)
                .setTokenId(token)
                .addMetadata("0x01")
                .addMetadata("0x02")
                .execute(env.client)
        ).getReceipt(env.client);

        let err = false;

        try {
            await new TokenNftInfoQuery()
            .setNodeAccountIds(env.nodeAccountIds)
            .setNftId(new NftId(token, 3))
            .execute(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidNftId);
        }

        expect(err).to.be.true;
    });

    it("Cannot query NFT info by invalid NftId Serial Number", async function () {
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

        let err = false;

        try {
            await new TokenNftInfoQuery()
            .setNodeAccountIds(env.nodeAccountIds)
            .setNftId(new NftId(token, 0))
            .execute(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidTokenNftSerialNumber);
        }

        expect(err).to.be.true;
    });

    it("Cannot transfer NFTs you don't own", async function () {
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
                    .addMetadata("0x01")
                    .addMetadata("0x02")
                    .execute(env.client)
            ).getReceipt(env.client)
        ).serials;

        let serial = serials[0];

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

        serial = serials[1];

        let err = false;

        try {
            await (
                await (
                    await new TransferTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .addNftTransfer(token, serial, account, env.operatorId)
                    .freezeWith(env.client)
                    .sign(key)
                ).execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.SenderDoesNotOwnNftSerialNo);
        }

        expect(err).to.be.true;

        serial = serials[0];

        await (
            await new TokenWipeTransaction()
                .setNodeAccountIds(env.nodeAccountIds)
                .setTokenId(token)
                .setAccountId(account)
                .setSerials([serial])
                .execute(env.client)
        ).getReceipt(env.client);
    });

    it("Cannot wipe accounts NFTs if the account doesn't own them", async function () {
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
                    .addMetadata("0x01")
                    .addMetadata("0x02")
                    .execute(env.client)
            ).getReceipt(env.client)
        ).serials;

        let serial = serials[0];

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

        serial = serials[1];

        let err = false;

        try {
            await (
                await new TokenWipeTransaction()
                    .setNodeAccountIds(env.nodeAccountIds)
                    .setTokenId(token)
                    .setAccountId(account)
                    .setSerials([serial])
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.AccountDoesNotOwnWipedNft);
        }

        expect(err).to.be.true;
    });
});
