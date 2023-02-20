import {
    AccountCreateTransaction,
    AccountAllowanceApproveTransaction,
    AccountAllowanceDeleteTransaction,
    Hbar,
    NftId,
    PrivateKey,
    Status,
    TransactionId,
    TokenAssociateTransaction,
    TokenBurnTransaction,
    TokenCreateTransaction,
    TokenGrantKycTransaction,
    TokenMintTransaction,
    TokenNftInfoQuery,
    TokenType,
    TokenWipeTransaction,
    TransferTransaction,
} from "../../src/exports.js";
import Client from "../../src/client/NodeClient.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("TokenNft", function () {
    let env;

    before(async function () {
        env = await IntegrationTestEnv.new();
    });

    it("Should be able to transfer NFT", async function () {
        this.timeout(120000);

        const key = PrivateKey.generateED25519();

        const account = (
            await (
                await new AccountCreateTransaction()
                    .setKey(key)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const token = (
            await (
                await new TokenCreateTransaction()
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

        const serials = (
            await (
                await new TokenMintTransaction()
                    .setTokenId(token)
                    .addMetadata(Uint8Array.of(0x01))
                    .addMetadata(Uint8Array.of(0x02))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).serials;

        const serial = serials[0];

        let info = await new TokenNftInfoQuery()
            .setNftId(new NftId(token, serial))
            .execute(env.client);

        expect(info[0].accountId.toString()).to.be.equal(
            env.operatorId.toString()
        );

        await (
            await new TransferTransaction()
                .addNftTransfer(token, serial, env.operatorId, account)
                .execute(env.client)
        ).getReceipt(env.client);

        info = await new TokenNftInfoQuery()
            .setNftId(new NftId(token, serial))
            .execute(env.client);

        expect(info[0].accountId.toString()).to.be.equal(account.toString());

        await (
            await new TokenWipeTransaction()
                .setTokenId(token)
                .setAccountId(account)
                .setSerials([serial])
                .execute(env.client)
        ).getReceipt(env.client);

        await (
            await new TokenBurnTransaction()
                .setTokenId(token)
                .setSerials([serials[1]])
                .execute(env.client)
        ).getReceipt(env.client);
    });

    it("Cannot burn NFTs when NFT is not owned by treasury", async function () {
        this.timeout(120000);

        const key = PrivateKey.generateED25519();

        const account = (
            await (
                await new AccountCreateTransaction()
                    .setKey(key)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const token = (
            await (
                await new TokenCreateTransaction()
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

        const serials = (
            await (
                await new TokenMintTransaction()
                    .setTokenId(token)
                    .addMetadata(Uint8Array.of(0x01))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).serials;

        const serial = serials[0];

        let info = await new TokenNftInfoQuery()
            .setNftId(new NftId(token, serial))
            .execute(env.client);

        expect(info[0].accountId.toString()).to.be.equal(
            env.operatorId.toString()
        );

        await (
            await new TransferTransaction()
                .addNftTransfer(token, serial, env.operatorId, account)
                .execute(env.client)
        ).getReceipt(env.client);

        info = await new TokenNftInfoQuery()
            .setNftId(new NftId(token, serial))
            .execute(env.client);

        expect(info[0].accountId.toString()).to.be.equal(account.toString());

        let err = false;

        try {
            await (
                await new TokenBurnTransaction()
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
        this.timeout(120000);

        const key = PrivateKey.generateED25519();

        const account = (
            await (
                await new AccountCreateTransaction()
                    .setKey(key)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const token = (
            await (
                await new TokenCreateTransaction()
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
                await new TokenMintTransaction()
                    .setTokenId(token)
                    .addMetadata(
                        Uint8Array.of(
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00,
                            0x00
                        )
                    )
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.MetadataTooLong);
        }

        expect(err).to.be.true;
    });

    it("Cannot query NFT info by invalid NftId", async function () {
        this.timeout(120000);

        const key = PrivateKey.generateED25519();

        const account = (
            await (
                await new AccountCreateTransaction()
                    .setKey(key)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const token = (
            await (
                await new TokenCreateTransaction()
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
            await new TokenMintTransaction()
                .setTokenId(token)
                .addMetadata(Uint8Array.of(0x01))
                .addMetadata(Uint8Array.of(0x02))
                .execute(env.client)
        ).getReceipt(env.client);

        let err = false;

        try {
            await new TokenNftInfoQuery()
                .setNftId(new NftId(token, 3))
                .execute(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidNftId);
        }

        expect(err).to.be.true;
    });

    it("Cannot query NFT info by invalid NftId Serial Number", async function () {
        this.timeout(120000);

        const key = PrivateKey.generateED25519();

        const account = (
            await (
                await new AccountCreateTransaction()
                    .setKey(key)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const token = (
            await (
                await new TokenCreateTransaction()
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
            await new TokenNftInfoQuery()
                .setNftId(new NftId(token, 0))
                .execute(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidTokenNftSerialNumber);
        }

        expect(err).to.be.true;
    });

    it("Cannot transfer NFTs you don't own", async function () {
        this.timeout(120000);

        const key = PrivateKey.generateED25519();

        const account = (
            await (
                await new AccountCreateTransaction()
                    .setKey(key)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const token = (
            await (
                await new TokenCreateTransaction()
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

        const serials = (
            await (
                await new TokenMintTransaction()
                    .setTokenId(token)
                    .addMetadata(Uint8Array.of(0x01))
                    .addMetadata(Uint8Array.of(0x02))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).serials;

        let serial = serials[0];

        let info = await new TokenNftInfoQuery()
            .setNftId(new NftId(token, serial))
            .execute(env.client);

        expect(info[0].accountId.toString()).to.be.equal(
            env.operatorId.toString()
        );

        await (
            await new TransferTransaction()
                .addNftTransfer(token, serial, env.operatorId, account)
                .execute(env.client)
        ).getReceipt(env.client);

        info = await new TokenNftInfoQuery()
            .setNftId(new NftId(token, serial))
            .execute(env.client);

        expect(info[0].accountId.toString()).to.be.equal(account.toString());

        serial = serials[1];

        let err = false;

        try {
            await (
                await (
                    await new TransferTransaction()
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
                .setTokenId(token)
                .setAccountId(account)
                .setSerials([serial])
                .execute(env.client)
        ).getReceipt(env.client);
    });

    it("Cannot wipe accounts NFTs if the account doesn't own them", async function () {
        this.timeout(120000);

        const key = PrivateKey.generateED25519();

        const account = (
            await (
                await new AccountCreateTransaction()
                    .setKey(key)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const token = (
            await (
                await new TokenCreateTransaction()
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

        const serials = (
            await (
                await new TokenMintTransaction()
                    .setTokenId(token)
                    .addMetadata(Uint8Array.of(0x01))
                    .addMetadata(Uint8Array.of(0x02))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).serials;

        let serial = serials[0];

        let info = await new TokenNftInfoQuery()
            .setNftId(new NftId(token, serial))
            .execute(env.client);

        expect(info[0].accountId.toString()).to.be.equal(
            env.operatorId.toString()
        );

        await (
            await new TransferTransaction()
                .addNftTransfer(token, serial, env.operatorId, account)
                .execute(env.client)
        ).getReceipt(env.client);

        info = await new TokenNftInfoQuery()
            .setNftId(new NftId(token, serial))
            .execute(env.client);

        expect(info[0].accountId.toString()).to.be.equal(account.toString());

        serial = serials[1];

        let err = false;

        try {
            await (
                await new TokenWipeTransaction()
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

    it("Cannot transfer on behalf of `spender` account without allowance approval", async function () {
        this.timeout(120000);

        const spenderKey = PrivateKey.generateED25519();
        const spenderAccountId = (
            await (
                await new AccountCreateTransaction()
                    .setKey(spenderKey)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const receiverKey = PrivateKey.generateED25519();
        const receiverAccountId = (
            await (
                await new AccountCreateTransaction()
                    .setKey(receiverKey)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const nftTokenId = (
            await (
                await new TokenCreateTransaction()
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
                    .setTokenIds([nftTokenId])
                    .setAccountId(spenderAccountId)
                    .freezeWith(env.client)
                    .sign(spenderKey)
            ).execute(env.client)
        ).getReceipt(env.client);

        const serials = (
            await (
                await new TokenMintTransaction()
                    .setTokenId(nftTokenId)
                    .addMetadata(Uint8Array.of(0x01))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).serials;

        const nft1 = new NftId(nftTokenId, serials[0]);

        let err = false;
        const onBehalfOfTransactionId =
            TransactionId.generate(spenderAccountId);
        try {
            await (
                await (
                    await new TransferTransaction()
                        .addApprovedNftTransfer(
                            nft1,
                            env.operatorId,
                            receiverAccountId
                        )
                        .setTransactionId(onBehalfOfTransactionId)
                        .freezeWith(env.client)
                        .sign(spenderKey)
                ).execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.SpenderDoesNotHaveAllowance);
        }

        expect(err).to.be.true;
    });

    it("Cannot transfer on behalf of `spender` account after removing the allowance approval", async function () {
        this.timeout(120000);

        const spenderKey = PrivateKey.generateED25519();
        const spenderAccountId = (
            await (
                await new AccountCreateTransaction()
                    .setKey(spenderKey)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const receiverKey = PrivateKey.generateED25519();
        const receiverAccountId = (
            await (
                await new AccountCreateTransaction()
                    .setKey(receiverKey)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const nftTokenId = (
            await (
                await new TokenCreateTransaction()
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTokenType(TokenType.NonFungibleUnique)
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
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
                    .setTokenIds([nftTokenId])
                    .setAccountId(spenderAccountId)
                    .freezeWith(env.client)
                    .sign(spenderKey)
            ).execute(env.client)
        ).getReceipt(env.client);

        await (
            await (
                await new TokenAssociateTransaction()
                    .setTokenIds([nftTokenId])
                    .setAccountId(receiverAccountId)
                    .freezeWith(env.client)
                    .sign(receiverKey)
            ).execute(env.client)
        ).getReceipt(env.client);

        const serials = (
            await (
                await new TokenMintTransaction()
                    .setTokenId(nftTokenId)
                    .addMetadata(Uint8Array.of(0x01))
                    .addMetadata(Uint8Array.of(0x02))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).serials;

        const nft1 = new NftId(nftTokenId, serials[0]);
        const nft2 = new NftId(nftTokenId, serials[1]);

        await new AccountAllowanceApproveTransaction()
            .approveTokenNftAllowance(nft1, env.operatorId, spenderAccountId)
            .approveTokenNftAllowance(nft2, env.operatorId, spenderAccountId)
            .execute(env.client);

        await (
            await new AccountAllowanceDeleteTransaction()
                .deleteAllTokenNftAllowances(nft2, env.operatorId)
                .execute(env.client)
        ).getReceipt(env.client);

        const onBehalfOfTransactionId =
            TransactionId.generate(spenderAccountId);
        await (
            await (
                await new TransferTransaction()
                    .addApprovedNftTransfer(
                        nft1,
                        env.operatorId,
                        receiverAccountId
                    )
                    .setTransactionId(onBehalfOfTransactionId)
                    .freezeWith(env.client)
                    .sign(spenderKey)
            ).execute(env.client)
        ).getReceipt(env.client);

        const info = await new TokenNftInfoQuery()
            .setNftId(nft1)
            .execute(env.client);

        expect(info[0].accountId.toString()).to.be.equal(
            receiverAccountId.toString()
        );

        let err = false;
        const onBehalfOfTransactionId2 =
            TransactionId.generate(spenderAccountId);
        try {
            await (
                await (
                    await new TransferTransaction()
                        .addApprovedNftTransfer(
                            nft2,
                            env.operatorId,
                            receiverAccountId
                        )
                        .setTransactionId(onBehalfOfTransactionId2)
                        .freezeWith(env.client)
                        .sign(spenderKey)
                ).execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.SpenderDoesNotHaveAllowance);
        }

        expect(err).to.be.true;
    });

    it("Cannot remove single serial number allowance when the allowance is given for all serials at once", async function () {
        this.timeout(120000);

        const spenderKey = PrivateKey.generateED25519();
        const spenderAccountId = (
            await (
                await new AccountCreateTransaction()
                    .setKey(spenderKey)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const receiverKey = PrivateKey.generateED25519();
        const receiverAccountId = (
            await (
                await new AccountCreateTransaction()
                    .setKey(receiverKey)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const nftTokenId = (
            await (
                await new TokenCreateTransaction()
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTokenType(TokenType.NonFungibleUnique)
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
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
                    .setTokenIds([nftTokenId])
                    .setAccountId(spenderAccountId)
                    .freezeWith(env.client)
                    .sign(spenderKey)
            ).execute(env.client)
        ).getReceipt(env.client);

        await (
            await (
                await new TokenAssociateTransaction()
                    .setTokenIds([nftTokenId])
                    .setAccountId(receiverAccountId)
                    .freezeWith(env.client)
                    .sign(receiverKey)
            ).execute(env.client)
        ).getReceipt(env.client);

        const serials = (
            await (
                await new TokenMintTransaction()
                    .setTokenId(nftTokenId)
                    .addMetadata(Uint8Array.of(0x01))
                    .addMetadata(Uint8Array.of(0x02))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).serials;

        const nft1 = new NftId(nftTokenId, serials[0]);
        const nft2 = new NftId(nftTokenId, serials[1]);

        await new AccountAllowanceApproveTransaction()
            .approveTokenNftAllowanceAllSerials(
                nftTokenId,
                env.operatorId,
                spenderAccountId
            )
            .execute(env.client);

        const onBehalfOfTransactionId =
            TransactionId.generate(spenderAccountId);
        await (
            await (
                await new TransferTransaction()
                    .addApprovedNftTransfer(
                        nft1,
                        env.operatorId,
                        receiverAccountId
                    )
                    .setTransactionId(onBehalfOfTransactionId)
                    .freezeWith(env.client)
                    .sign(spenderKey)
            ).execute(env.client)
        ).getReceipt(env.client);

        // hopefully in the future this should end up with a precheck error provided from services
        await (
            await new AccountAllowanceDeleteTransaction()
                .deleteAllTokenNftAllowances(nft2, env.operatorId)
                .execute(env.client)
        ).getReceipt(env.client);

        const onBehalfOfTransactionId2 =
            TransactionId.generate(spenderAccountId);
        await (
            await (
                await new TransferTransaction()
                    .addApprovedNftTransfer(
                        nft2,
                        env.operatorId,
                        receiverAccountId
                    )
                    .setTransactionId(onBehalfOfTransactionId2)
                    .freezeWith(env.client)
                    .sign(spenderKey)
            ).execute(env.client)
        ).getReceipt(env.client);

        const infoNft1 = await new TokenNftInfoQuery()
            .setNftId(nft1)
            .execute(env.client);

        const infoNft2 = await new TokenNftInfoQuery()
            .setNftId(nft2)
            .execute(env.client);

        expect(infoNft1[0].accountId.toString()).to.be.equal(
            receiverAccountId.toString()
        );

        expect(infoNft2[0].accountId.toString()).to.be.equal(
            receiverAccountId.toString()
        );
    });

    it("Account, which given the allowance for all serials at once, should be able to give allowances for single serial numbers to other accounts", async function () {
        this.timeout(120000);

        const spenderKey = PrivateKey.generateED25519();
        const spenderAccountId = (
            await (
                await new AccountCreateTransaction()
                    .setKey(spenderKey)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const delegateSpenderKey = PrivateKey.generateED25519();
        const delegateSpenderAccountId = (
            await (
                await new AccountCreateTransaction()
                    .setKey(delegateSpenderKey)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const receiverKey = PrivateKey.generateED25519();
        const receiverAccountId = (
            await (
                await new AccountCreateTransaction()
                    .setKey(receiverKey)
                    .setInitialBalance(new Hbar(2))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const nftTokenId = (
            await (
                await new TokenCreateTransaction()
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTokenType(TokenType.NonFungibleUnique)
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
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
                    .setTokenIds([nftTokenId])
                    .setAccountId(spenderAccountId)
                    .freezeWith(env.client)
                    .sign(spenderKey)
            ).execute(env.client)
        ).getReceipt(env.client);

        await (
            await (
                await new TokenAssociateTransaction()
                    .setTokenIds([nftTokenId])
                    .setAccountId(receiverAccountId)
                    .freezeWith(env.client)
                    .sign(receiverKey)
            ).execute(env.client)
        ).getReceipt(env.client);

        const serials = (
            await (
                await new TokenMintTransaction()
                    .setTokenId(nftTokenId)
                    .addMetadata(Uint8Array.of(0x01))
                    .addMetadata(Uint8Array.of(0x02))
                    .execute(env.client)
            ).getReceipt(env.client)
        ).serials;

        const nft1 = new NftId(nftTokenId, serials[0]);
        const nft2 = new NftId(nftTokenId, serials[1]);

        await (
            await new AccountAllowanceApproveTransaction()
                .approveTokenNftAllowanceAllSerials(
                    nftTokenId,
                    env.operatorId,
                    spenderAccountId
                )
                .execute(env.client)
        ).getReceipt(env.client);

        const spenderClient = Client.forLocalNode().setOperator(
            spenderAccountId,
            spenderKey
        );

        await (
            await new AccountAllowanceApproveTransaction()
                .approveTokenNftAllowanceWithDelegatingSpender(
                    nft1,
                    env.operatorId,
                    delegateSpenderAccountId,
                    spenderAccountId
                )
                .freezeWith(spenderClient)
                .execute(spenderClient)
        ).getReceipt(spenderClient);

        const onBehalfOfTransactionId = TransactionId.generate(
            delegateSpenderAccountId
        );
        await (
            await (
                await new TransferTransaction()
                    .addApprovedNftTransfer(
                        nft1,
                        env.operatorId,
                        receiverAccountId
                    )
                    .setTransactionId(onBehalfOfTransactionId)
                    .freezeWith(env.client)
                    .sign(delegateSpenderKey)
            ).execute(env.client)
        ).getReceipt(env.client);

        let err = false;
        const onBehalfOfTransactionId2 = TransactionId.generate(
            delegateSpenderAccountId
        );
        try {
            await (
                await (
                    await new TransferTransaction()
                        .addApprovedNftTransfer(
                            nft2,
                            env.operatorId,
                            receiverAccountId
                        )
                        .setTransactionId(onBehalfOfTransactionId2)
                        .freezeWith(env.client)
                        .sign(delegateSpenderKey)
                ).execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.SpenderDoesNotHaveAllowance);
        }

        expect(err).to.be.true;

        const infoNft1 = await new TokenNftInfoQuery()
            .setNftId(nft1)
            .execute(env.client);

        const infoNft2 = await new TokenNftInfoQuery()
            .setNftId(nft2)
            .execute(env.client);

        expect(infoNft1[0].accountId.toString()).to.be.equal(
            receiverAccountId.toString()
        );
        expect(infoNft2[0].accountId.toString()).to.be.equal(
            env.operatorId.toString()
        );
    });

    after(async function () {
        await env.close();
    });
});
