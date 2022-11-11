import {
    AccountCreateTransaction,
    PrivateKey,
    Status,
    TokenAssociateTransaction,
    TokenCreateTransaction,
    TokenGrantKycTransaction,
    TokenInfoQuery,
    TokenMintTransaction,
    TokenSupplyType,
    TokenType,
    TokenUpdateTransaction,
    TransferTransaction,
} from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("TokenUpdate", function () {
    let env;

    before(async function () {
        env = await IntegrationTestEnv.new();
    });

    it("should be executable", async function () {
        this.timeout(120000);

        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;
        const key1 = PrivateKey.generateED25519();
        const key2 = PrivateKey.generateED25519();
        const key3 = PrivateKey.generateED25519();
        const key4 = PrivateKey.generateED25519();

        const response = await new TokenCreateTransaction()
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setDecimals(3)
            .setInitialSupply(1000000)
            .setTreasuryAccountId(operatorId)
            .setAdminKey(operatorKey)
            .setKycKey(key1)
            .setFreezeKey(key2)
            .setWipeKey(key3)
            .setSupplyKey(key4)
            .setFreezeDefault(false)
            .execute(env.client);

        const token = (await response.getReceipt(env.client)).tokenId;

        let info = await new TokenInfoQuery()
            .setTokenId(token)
            .execute(env.client);

        expect(info.tokenId.toString()).to.eql(token.toString());
        expect(info.name).to.eql("ffff");
        expect(info.symbol).to.eql("F");
        expect(info.decimals).to.eql(3);
        expect(info.totalSupply.toInt()).to.eql(1000000);
        expect(info.treasuryAccountId.toString()).to.be.equal(
            operatorId.toString()
        );
        expect(info.adminKey.toString()).to.eql(operatorKey.toString());
        expect(info.kycKey.toString()).to.eql(key1.publicKey.toString());
        expect(info.freezeKey.toString()).to.eql(key2.publicKey.toString());
        expect(info.wipeKey.toString()).to.eql(key3.publicKey.toString());
        expect(info.supplyKey.toString()).to.eql(key4.publicKey.toString());
        expect(info.defaultFreezeStatus).to.be.false;
        expect(info.defaultKycStatus).to.be.false;
        expect(info.isDeleted).to.be.false;
        expect(info.autoRenewAccountId).to.be.not.null;
        expect(info.autoRenewAccountId.toString()).to.be.eql(
            operatorId.toString()
        );
        expect(info.autoRenewPeriod).to.be.not.null;
        expect(info.autoRenewPeriod.seconds.toInt()).to.be.eql(7776000);
        expect(info.expirationTime).to.be.not.null;

        await (
            await new TokenUpdateTransaction()
                .setTokenId(token)
                .setTokenName("aaaa")
                .setTokenSymbol("A")
                .execute(env.client)
        ).getReceipt(env.client);

        info = await new TokenInfoQuery().setTokenId(token).execute(env.client);

        expect(info.tokenId.toString()).to.eql(token.toString());
        expect(info.name).to.eql("aaaa");
        expect(info.symbol).to.eql("A");
        expect(info.decimals).to.eql(3);
        expect(info.totalSupply.toInt()).to.eql(1000000);
        expect(info.treasuryAccountId.toString()).to.be.equal(
            operatorId.toString()
        );
        expect(info.adminKey.toString()).to.eql(operatorKey.toString());
        expect(info.kycKey.toString()).to.eql(key1.publicKey.toString());
        expect(info.freezeKey.toString()).to.eql(key2.publicKey.toString());
        expect(info.wipeKey.toString()).to.eql(key3.publicKey.toString());
        expect(info.supplyKey.toString()).to.eql(key4.publicKey.toString());
        expect(info.defaultFreezeStatus).to.be.false;
        expect(info.defaultKycStatus).to.be.false;
        expect(info.isDeleted).to.be.false;
        expect(info.autoRenewAccountId).to.be.not.null;
        expect(info.autoRenewAccountId.toString()).to.be.eql(
            operatorId.toString()
        );
        expect(info.autoRenewPeriod).to.be.not.null;
        expect(info.autoRenewPeriod.seconds.toInt()).to.be.eql(7776000);
        expect(info.expirationTime).to.be.not.null;
    });

    it("should be able to update treasury", async function () {
        this.timeout(120000);

        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;
        const key1 = PrivateKey.generateED25519();
        const key2 = PrivateKey.generateED25519();
        const key3 = PrivateKey.generateED25519();
        const key4 = PrivateKey.generateED25519();
        const key5 = PrivateKey.generateED25519();

        const response = await new TokenCreateTransaction()
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setDecimals(3)
            .setInitialSupply(1000000)
            .setTreasuryAccountId(operatorId)
            .setAdminKey(operatorKey)
            .setKycKey(key1)
            .setFreezeKey(key2)
            .setWipeKey(key3)
            .setSupplyKey(key4)
            .setFreezeDefault(false)
            .execute(env.client);

        const token = (await response.getReceipt(env.client)).tokenId;

        const treasuryAccountId = (
            await (
                await (
                    await new AccountCreateTransaction()
                        .setKey(key5)
                        .freezeWith(env.client)
                        .sign(key5)
                ).execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        let info = await new TokenInfoQuery()
            .setTokenId(token)
            .execute(env.client);

        expect(info.tokenId.toString()).to.eql(token.toString());
        expect(info.name).to.eql("ffff");
        expect(info.symbol).to.eql("F");
        expect(info.decimals).to.eql(3);
        expect(info.totalSupply.toInt()).to.eql(1000000);
        expect(info.treasuryAccountId.toString()).to.be.equal(
            operatorId.toString()
        );
        expect(info.adminKey.toString()).to.eql(operatorKey.toString());
        expect(info.kycKey.toString()).to.eql(key1.publicKey.toString());
        expect(info.freezeKey.toString()).to.eql(key2.publicKey.toString());
        expect(info.wipeKey.toString()).to.eql(key3.publicKey.toString());
        expect(info.supplyKey.toString()).to.eql(key4.publicKey.toString());
        expect(info.defaultFreezeStatus).to.be.false;
        expect(info.defaultKycStatus).to.be.false;
        expect(info.isDeleted).to.be.false;
        expect(info.autoRenewAccountId).to.be.not.null;
        expect(info.autoRenewAccountId.toString()).to.be.eql(
            operatorId.toString()
        );
        expect(info.autoRenewPeriod).to.be.not.null;
        expect(info.autoRenewPeriod.seconds.toInt()).to.be.eql(7776000);
        expect(info.expirationTime).to.be.not.null;

        await (
            await (
                await new TokenAssociateTransaction()
                    .setTokenIds([token])
                    .setAccountId(treasuryAccountId)
                    .freezeWith(env.client)
                    .sign(key5)
            ).execute(env.client)
        ).getReceipt(env.client);

        await (
            await (
                await new TokenUpdateTransaction()
                    .setTokenId(token)
                    .setTokenName("aaaa")
                    .setTokenSymbol("A")
                    .setTreasuryAccountId(treasuryAccountId)
                    .freezeWith(env.client)
                    .sign(key5)
            ).execute(env.client)
        ).getReceipt(env.client);

        info = await new TokenInfoQuery().setTokenId(token).execute(env.client);

        expect(info.tokenId.toString()).to.eql(token.toString());
        expect(info.name).to.eql("aaaa");
        expect(info.symbol).to.eql("A");
        expect(info.decimals).to.eql(3);
        expect(info.totalSupply.toInt()).to.eql(1000000);
        expect(info.treasuryAccountId.toString()).to.be.equal(
            treasuryAccountId.toString()
        );
        expect(info.adminKey.toString()).to.eql(operatorKey.toString());
        expect(info.kycKey.toString()).to.eql(key1.publicKey.toString());
        expect(info.freezeKey.toString()).to.eql(key2.publicKey.toString());
        expect(info.wipeKey.toString()).to.eql(key3.publicKey.toString());
        expect(info.supplyKey.toString()).to.eql(key4.publicKey.toString());
        expect(info.defaultFreezeStatus).to.be.false;
        expect(info.defaultKycStatus).to.be.false;
        expect(info.isDeleted).to.be.false;
        expect(info.autoRenewAccountId).to.be.not.null;
        expect(info.autoRenewAccountId.toString()).to.be.eql(
            operatorId.toString()
        );
        expect(info.autoRenewPeriod).to.be.not.null;
        expect(info.autoRenewPeriod.seconds.toInt()).to.be.eql(7776000);
        expect(info.expirationTime).to.be.not.null;
    });

    it("should be executable when no properties except token ID are set", async function () {
        this.timeout(120000);

        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;
        const key1 = PrivateKey.generateED25519();
        const key2 = PrivateKey.generateED25519();
        const key3 = PrivateKey.generateED25519();
        const key4 = PrivateKey.generateED25519();

        const response = await new TokenCreateTransaction()
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setDecimals(3)
            .setInitialSupply(1000000)
            .setTreasuryAccountId(operatorId)
            .setAdminKey(operatorKey)
            .setKycKey(key1)
            .setFreezeKey(key2)
            .setWipeKey(key3)
            .setSupplyKey(key4)
            .setFreezeDefault(false)
            .execute(env.client);

        const token = (await response.getReceipt(env.client)).tokenId;

        await (
            await new TokenUpdateTransaction()
                .setTokenId(token)
                .execute(env.client)
        ).getReceipt(env.client);
    });

    it("should error updating immutable token", async function () {
        this.timeout(120000);

        const operatorId = env.operatorId;

        const response = await new TokenCreateTransaction()
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setTreasuryAccountId(operatorId)
            .execute(env.client);

        const token = (await response.getReceipt(env.client)).tokenId;

        let err = false;

        try {
            await (
                await new TokenUpdateTransaction()
                    .setTokenId(token)
                    .setTokenName("aaaa")
                    .setTokenSymbol("A")
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.TokenIsImmutable);
        }

        if (!err) {
            throw new Error("token update did not error");
        }
    });

    it("should error when token ID is not set", async function () {
        this.timeout(120000);

        let err = false;

        try {
            await (
                await new TokenUpdateTransaction().execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidTokenId);
        }

        if (!err) {
            throw new Error("token update did not error");
        }
    });

    it("should be exectuable when updating immutable token, but not setting any fields besides token ID", async function () {
        this.timeout(120000);

        const operatorId = env.operatorId;

        const response = await new TokenCreateTransaction()
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setTreasuryAccountId(operatorId)
            .execute(env.client);

        const token = (await response.getReceipt(env.client)).tokenId;

        await (
            await new TokenUpdateTransaction()
                .setTokenId(token)
                .execute(env.client)
        ).getReceipt(env.client);
    });

    it("should error when admin key does not sign transaction", async function () {
        this.timeout(120000);

        const operatorId = env.operatorId;
        const key = PrivateKey.generateED25519();

        const response = await (
            await new TokenCreateTransaction()
                .setTokenName("ffff")
                .setTokenSymbol("F")
                .setTreasuryAccountId(operatorId)
                .setAdminKey(key)
                .freezeWith(env.client)
                .sign(key)
        ).execute(env.client);

        const token = (await response.getReceipt(env.client)).tokenId;

        let err = false;

        try {
            await (
                await new TokenUpdateTransaction()
                    .setTokenId(token)
                    .setTokenName("aaaa")
                    .setTokenSymbol("A")
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidSignature);
        }

        if (!err) {
            throw new Error("token update did not error");
        }
    });

    // eslint-disable-next-line mocha/no-skipped-tests
    // it.skip("cannot change current treasury until no NFTs are owned", async function () {
    //     this.timeout(120000);

    //     const key = PrivateKey.generateED25519();

    //     const account = (
    //         await (
    //             await new AccountCreateTransaction()
    //                 .setKey(key.publicKey)
    //                 .execute(env.client)
    //         ).getReceipt(env.client)
    //     ).accountId;

    //     const token = (
    //         await (
    //             await new TokenCreateTransaction()
    //                 .setTokenName("ffff")
    //                 .setTokenSymbol("F")
    //                 .setTreasuryAccountId(env.operatorId)
    //                 .setAdminKey(env.operatorKey)
    //                 .setKycKey(env.operatorKey)
    //                 .setFreezeKey(env.operatorKey)
    //                 .setWipeKey(env.operatorKey)
    //                 .setSupplyKey(env.operatorKey)
    //                 .setFeeScheduleKey(env.operatorKey)
    //                 .setTokenType(TokenType.NonFungibleUnique)
    //                 .setSupplyType(TokenSupplyType.Infinite)
    //                 .execute(env.client)
    //         ).getReceipt(env.client)
    //     ).tokenId;

    //     await (
    //         await (
    //             await new TokenAssociateTransaction()
    //                 .setTokenIds([token])
    //                 .setAccountId(account)
    //                 .freezeWith(env.client)
    //                 .sign(key)
    //         ).execute(env.client)
    //     ).getReceipt(env.client);

    //     await (
    //         await (
    //             await new TokenGrantKycTransaction()
    //                 .setTokenId(token)
    //                 .setAccountId(account)
    //                 .freezeWith(env.client)
    //                 .sign(key)
    //         ).execute(env.client)
    //     ).getReceipt(env.client);

    //     await (
    //         await new TokenMintTransaction()
    //             .setMetadata([
    //                 Uint8Array.of([0, 1, 2]),
    //                 Uint8Array.of([3, 4, 5]),
    //             ])
    //             .setTokenId(token)
    //             .execute(env.client)
    //     ).getReceipt(env.client);

    //     await (
    //         await new TransferTransaction()
    //             .addNftTransfer(token, 1, env.operatorId, account)
    //             .execute(env.client)
    //     ).getReceipt(env.client);

    //     let err = false;

    //     try {
    //         await (
    //             await (
    //                 await new TokenUpdateTransaction()
    //                     .setTokenId(token)
    //                     .setTreasuryAccountId(account)
    //                     .freezeWith(env.client)
    //                     .sign(key)
    //             ).execute(env.client)
    //         ).getReceipt(env.client);
    //     } catch (error) {
    //         console.log(error);
    //         err = error
    //             .toString()
    //             .includes(Status.CurrentTreasuryStillOwnsNfts);
    //     }

    //     if (!err) {
    //         throw new Error("token update did not error");
    //     }
    // });

    after(async function () {
        await env.close();
    });
});
