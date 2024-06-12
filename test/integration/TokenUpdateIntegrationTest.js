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
        env = await IntegrationTestEnv.new({ balance: 1000 });
    });

    it("should be executable", async function () {
        this.timeout(120000);

        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;
        const key1 = PrivateKey.generateED25519();
        const key2 = PrivateKey.generateED25519();
        const key3 = PrivateKey.generateED25519();
        const key4 = PrivateKey.generateED25519();
        const key5 = PrivateKey.generateED25519();
        const metadataKey = PrivateKey.generateED25519();
        const newMetadataKey = PrivateKey.generateED25519();
        const metadata = new Uint8Array([1]);

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
            .setPauseKey(key5)
            .setMetadata(metadata)
            .setMetadataKey(metadataKey)
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
            operatorId.toString(),
        );
        expect(info.adminKey.toString()).to.eql(operatorKey.toString());
        expect(info.kycKey.toString()).to.eql(key1.publicKey.toString());
        expect(info.freezeKey.toString()).to.eql(key2.publicKey.toString());
        expect(info.wipeKey.toString()).to.eql(key3.publicKey.toString());
        expect(info.supplyKey.toString()).to.eql(key4.publicKey.toString());
        expect(info.pauseKey.toString()).to.eql(key5.publicKey.toString());
        expect(info.metadataKey.toString()).to.eql(
            metadataKey.publicKey.toString(),
        );
        expect(info.metadata).to.eql(metadata);
        expect(info.defaultFreezeStatus).to.be.false;
        expect(info.defaultKycStatus).to.be.false;
        expect(info.isDeleted).to.be.false;
        expect(info.autoRenewAccountId).to.be.null;
        expect(info.autoRenewPeriod).to.be.null;
        expect(info.expirationTime).to.be.not.null;

        await (
            await new TokenUpdateTransaction()
                .setTokenId(token)
                .setTokenName("aaaa")
                .setTokenSymbol("A")
                .setMetadataKey(newMetadataKey)
                .execute(env.client)
        ).getReceipt(env.client);

        info = await new TokenInfoQuery().setTokenId(token).execute(env.client);

        expect(info.tokenId.toString()).to.eql(token.toString());
        expect(info.name).to.eql("aaaa");
        expect(info.symbol).to.eql("A");
        expect(info.decimals).to.eql(3);
        expect(info.totalSupply.toInt()).to.eql(1000000);
        expect(info.treasuryAccountId.toString()).to.be.equal(
            operatorId.toString(),
        );
        expect(info.adminKey.toString()).to.eql(operatorKey.toString());
        expect(info.kycKey.toString()).to.eql(key1.publicKey.toString());
        expect(info.freezeKey.toString()).to.eql(key2.publicKey.toString());
        expect(info.wipeKey.toString()).to.eql(key3.publicKey.toString());
        expect(info.supplyKey.toString()).to.eql(key4.publicKey.toString());
        expect(info.metadataKey.toString()).to.eql(
            newMetadataKey.publicKey.toString(),
        );
        expect(info.metadata).to.eql(metadata);
        expect(info.defaultFreezeStatus).to.be.false;
        expect(info.defaultKycStatus).to.be.false;
        expect(info.isDeleted).to.be.false;
        expect(info.autoRenewAccountId).to.be.null;
        expect(info.autoRenewPeriod).to.be.null;
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
            operatorId.toString(),
        );
        expect(info.adminKey.toString()).to.eql(operatorKey.toString());
        expect(info.kycKey.toString()).to.eql(key1.publicKey.toString());
        expect(info.freezeKey.toString()).to.eql(key2.publicKey.toString());
        expect(info.wipeKey.toString()).to.eql(key3.publicKey.toString());
        expect(info.supplyKey.toString()).to.eql(key4.publicKey.toString());
        expect(info.defaultFreezeStatus).to.be.false;
        expect(info.defaultKycStatus).to.be.false;
        expect(info.isDeleted).to.be.false;
        expect(info.autoRenewAccountId).to.be.null;
        expect(info.autoRenewPeriod).to.be.null;
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
            treasuryAccountId.toString(),
        );
        expect(info.adminKey.toString()).to.eql(operatorKey.toString());
        expect(info.kycKey.toString()).to.eql(key1.publicKey.toString());
        expect(info.freezeKey.toString()).to.eql(key2.publicKey.toString());
        expect(info.wipeKey.toString()).to.eql(key3.publicKey.toString());
        expect(info.supplyKey.toString()).to.eql(key4.publicKey.toString());
        expect(info.defaultFreezeStatus).to.be.false;
        expect(info.defaultKycStatus).to.be.false;
        expect(info.isDeleted).to.be.false;
        expect(info.autoRenewAccountId).to.be.null;
        expect(info.autoRenewPeriod).to.be.null;
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

        let status;

        try {
            await (
                await new TokenUpdateTransaction()
                    .setTokenId(token)
                    .setTokenName("aaaa")
                    .setTokenSymbol("A")
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            status = error.status;
        }

        expect(status).to.be.eql(Status.TokenIsImmutable);
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

    it("should return error when updating immutable token", async function () {
        this.timeout(120000);

        let status;
        const operatorId = env.operatorId;

        try {
            const response = await new TokenCreateTransaction()
                .setTokenSymbol("F")
                .setTreasuryAccountId(operatorId)
                .execute(env.client);

            const token = (await response.getReceipt(env.client)).tokenId;

            await (
                await new TokenUpdateTransaction()
                    .setTokenId(token)
                    .setTokenName("aaaa")
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            status = error.status;
        }

        expect(status).to.be.eql(Status.TokenIsImmutable);
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
    it.skip("cannot change current treasury until no NFTs are owned", async function () {
        this.timeout(120000);

        const key = PrivateKey.generateED25519();

        const account = (
            await (
                await new AccountCreateTransaction()
                    .setKey(key.publicKey)
                    .execute(env.client)
            ).getReceipt(env.client)
        ).accountId;

        const token = (
            await (
                await new TokenCreateTransaction()
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(env.operatorId)
                    .setAdminKey(env.operatorKey)
                    .setKycKey(env.operatorKey)
                    .setFreezeKey(env.operatorKey)
                    .setWipeKey(env.operatorKey)
                    .setSupplyKey(env.operatorKey)
                    .setFeeScheduleKey(env.operatorKey)
                    .setTokenType(TokenType.NonFungibleUnique)
                    .setSupplyType(TokenSupplyType.Infinite)
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
                .setMetadata([
                    Uint8Array.of([0, 1, 2]),
                    Uint8Array.of([3, 4, 5]),
                ])
                .setTokenId(token)
                .execute(env.client)
        ).getReceipt(env.client);

        await (
            await new TransferTransaction()
                .addNftTransfer(token, 1, env.operatorId, account)
                .execute(env.client)
        ).getReceipt(env.client);

        let err = false;

        try {
            await (
                await (
                    await new TokenUpdateTransaction()
                        .setTokenId(token)
                        .setTreasuryAccountId(account)
                        .freezeWith(env.client)
                        .sign(key)
                ).execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error
                .toString()
                .includes(Status.CurrentTreasuryStillOwnsNfts);
        }

        if (!err) {
            throw new Error("token update did not error");
        }
    });

    describe("[HIP-646] Fungible Token Metadata Field", function () {
        it("should update the metadata of token after signing the transaction with metadata key", async function () {
            this.timeout(120000);

            let tokenInfo;
            const operatorId = env.operatorId;
            const metadataKey = PrivateKey.generateED25519();
            const metadata = new Uint8Array([1]);
            const newMetadata = new Uint8Array([1, 2]);

            const tokenCreateTx = new TokenCreateTransaction()
                .setTokenName("Test")
                .setTokenSymbol("T")
                .setTokenType(TokenType.FungibleCommon)
                .setDecimals(3)
                .setInitialSupply(1000000)
                .setTreasuryAccountId(operatorId)
                .setMetadata(metadata)
                .setMetadataKey(metadataKey);

            const tokenCreateTxresponse = await tokenCreateTx.execute(
                env.client,
            );
            const tokenCreateTxReceipt = await tokenCreateTxresponse.getReceipt(
                env.client,
            );
            const tokenId = tokenCreateTxReceipt.tokenId;

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);
            expect(tokenInfo.metadata).to.eql(metadata);

            const tokenUpdateTx = new TokenUpdateTransaction()
                .setTokenId(tokenId)
                .setMetadata(newMetadata)
                .freezeWith(env.client);

            await (
                await (
                    await tokenUpdateTx.sign(metadataKey)
                ).execute(env.client)
            ).getReceipt(env.client);

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);

            expect(tokenInfo.metadata).to.eql(newMetadata);
        });

        it("should update the metadata of token after signing the transaction with admin key", async function () {
            this.timeout(120000);

            const operatorId = env.operatorId;
            const adminKey = env.operatorKey;
            const metadata = new Uint8Array([1]);
            const newMetadata = new Uint8Array([1, 2]);
            let tokenInfo;

            const tokenCreateTx = new TokenCreateTransaction()
                .setTokenName("Test")
                .setTokenSymbol("T")
                .setTokenType(TokenType.FungibleCommon)
                .setDecimals(3)
                .setInitialSupply(1000000)
                .setTreasuryAccountId(operatorId)
                .setAdminKey(adminKey)
                .setMetadata(metadata);

            const tokenCreateTxresponse = await tokenCreateTx.execute(
                env.client,
            );
            const tokenCreateTxReceipt = await tokenCreateTxresponse.getReceipt(
                env.client,
            );
            const tokenId = tokenCreateTxReceipt.tokenId;

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);
            expect(tokenInfo.metadata).to.eql(metadata);

            const tokenUpdateTx = new TokenUpdateTransaction()
                .setTokenId(tokenId)
                .setMetadata(newMetadata)
                .freezeWith(env.client);

            await (
                await (await tokenUpdateTx.sign(adminKey)).execute(env.client)
            ).getReceipt(env.client);

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);

            expect(tokenInfo.metadata).to.eql(newMetadata);
        });

        it("should NOT update the metadata of token when the new metadata is NOT set", async function () {
            this.timeout(120000);

            const operatorId = env.operatorId;
            const adminKey = env.operatorKey;
            const metadata = new Uint8Array([1]);
            let tokenInfo;

            const tokenCreateTx = new TokenCreateTransaction()
                .setTokenName("Test")
                .setTokenSymbol("T")
                .setTokenType(TokenType.FungibleCommon)
                .setDecimals(3)
                .setInitialSupply(1000000)
                .setTreasuryAccountId(operatorId)
                .setAdminKey(adminKey)
                .setMetadata(metadata);

            const tokenCreateTxresponse = await tokenCreateTx.execute(
                env.client,
            );
            const tokenCreateTxReceipt = await tokenCreateTxresponse.getReceipt(
                env.client,
            );
            const tokenId = tokenCreateTxReceipt.tokenId;

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);
            expect(tokenInfo.metadata).to.eql(metadata);

            const tokenUpdateTx = new TokenUpdateTransaction()
                .setTokenId(tokenId)
                .freezeWith(env.client);

            await (
                await (await tokenUpdateTx.sign(adminKey)).execute(env.client)
            ).getReceipt(env.client);

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);

            expect(tokenInfo.metadata).to.eql(metadata);
        });

        it("should earse the metadata of token after signing the transaction with metadata key", async function () {
            this.timeout(120000);

            let tokenInfo;
            const operatorId = env.operatorId;
            const metadataKey = PrivateKey.generateED25519();
            const metadata = new Uint8Array([1]);
            const newMetadata = new Uint8Array();

            const tokenCreateTx = new TokenCreateTransaction()
                .setTokenName("Test")
                .setTokenSymbol("T")
                .setTokenType(TokenType.FungibleCommon)
                .setDecimals(3)
                .setInitialSupply(1000000)
                .setTreasuryAccountId(operatorId)
                .setMetadata(metadata)
                .setMetadataKey(metadataKey);

            const tokenCreateTxresponse = await tokenCreateTx.execute(
                env.client,
            );
            const tokenCreateTxReceipt = await tokenCreateTxresponse.getReceipt(
                env.client,
            );
            const tokenId = tokenCreateTxReceipt.tokenId;

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);
            expect(tokenInfo.metadata).to.eql(metadata);

            const tokenUpdateTx = new TokenUpdateTransaction()
                .setTokenId(tokenId)
                .setMetadata(newMetadata)
                .freezeWith(env.client);

            await (
                await (
                    await tokenUpdateTx.sign(metadataKey)
                ).execute(env.client)
            ).getReceipt(env.client);

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);

            expect(tokenInfo.metadata).to.eql(newMetadata);
        });

        it("should earse the metadata of token after signing the transaction with admin key", async function () {
            this.timeout(120000);

            const operatorId = env.operatorId;
            const adminKey = env.operatorKey;
            const metadata = new Uint8Array([1]);
            const newMetadata = new Uint8Array();
            let tokenInfo;

            const tokenCreateTx = new TokenCreateTransaction()
                .setTokenName("Test")
                .setTokenSymbol("T")
                .setTokenType(TokenType.FungibleCommon)
                .setDecimals(3)
                .setInitialSupply(1000000)
                .setTreasuryAccountId(operatorId)
                .setMetadata(metadata)
                .setAdminKey(adminKey);

            const tokenCreateTxresponse = await tokenCreateTx.execute(
                env.client,
            );
            const tokenCreateTxReceipt = await tokenCreateTxresponse.getReceipt(
                env.client,
            );
            const tokenId = tokenCreateTxReceipt.tokenId;

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);
            expect(tokenInfo.metadata).to.eql(metadata);

            const tokenUpdateTx = new TokenUpdateTransaction()
                .setTokenId(tokenId)
                .setMetadata(newMetadata)
                .freezeWith(env.client);

            await (
                await (await tokenUpdateTx.sign(adminKey)).execute(env.client)
            ).getReceipt(env.client);

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);

            expect(tokenInfo.metadata).to.eql(newMetadata);
        });

        it("should NOT update the metadata of token when the transaction is not signed with metadata or admin key", async function () {
            this.timeout(120000);

            let status;
            const operatorId = env.operatorId;
            const adminKey = PrivateKey.generateED25519();
            const metadataKey = PrivateKey.generateED25519();
            const wrongKey = PrivateKey.generateED25519();
            const metadata = new Uint8Array([1]);
            const newMetadata = new Uint8Array([1, 2]);

            try {
                const tokenCreateTx = new TokenCreateTransaction()
                    .setTokenName("Test")
                    .setTokenSymbol("T")
                    .setTokenType(TokenType.FungibleCommon)
                    .setDecimals(3)
                    .setInitialSupply(1000000)
                    .setTreasuryAccountId(operatorId)
                    .setAdminKey(adminKey)
                    .setMetadata(metadata)
                    .setMetadataKey(metadataKey);

                const tokenCreateTxresponse = await tokenCreateTx.execute(
                    env.client,
                );
                const tokenCreateTxReceipt =
                    await tokenCreateTxresponse.getReceipt(env.client);
                const tokenId = tokenCreateTxReceipt.tokenId;

                const tokenUpdateTx = new TokenUpdateTransaction()
                    .setTokenId(tokenId)
                    .setMetadata(newMetadata)
                    .freezeWith(env.client);

                await (
                    await (
                        await tokenUpdateTx.sign(wrongKey)
                    ).execute(env.client)
                ).getReceipt(env.client);
            } catch (error) {
                status = error.status;
            }
            expect(status).to.be.eql(Status.InvalidSignature);
        });

        it("should NOT update the metadata of token if the metadata or admin keys are NOT set", async function () {
            this.timeout(120000);

            let status;
            const operatorId = env.operatorId;
            const metadata = new Uint8Array([1]);
            const newMetadata = new Uint8Array([1, 2]);

            try {
                const tokenCreateTx = new TokenCreateTransaction()
                    .setTokenName("Test")
                    .setTokenSymbol("T")
                    .setTokenType(TokenType.FungibleCommon)
                    .setDecimals(3)
                    .setInitialSupply(1000000)
                    .setTreasuryAccountId(operatorId)
                    .setMetadata(metadata);

                const tokenCreateTxresponse = await tokenCreateTx.execute(
                    env.client,
                );
                const tokenCreateTxReceipt =
                    await tokenCreateTxresponse.getReceipt(env.client);
                const tokenId = tokenCreateTxReceipt.tokenId;

                const tokenUpdateTx = new TokenUpdateTransaction()
                    .setTokenId(tokenId)
                    .setMetadata(newMetadata)
                    .freezeWith(env.client);

                await (
                    await tokenUpdateTx.execute(env.client)
                ).getReceipt(env.client);
            } catch (error) {
                status = error.status;
            }
            expect(status).to.be.eql(Status.TokenIsImmutable);
        });
    });

    describe("[HIP-765] Non Fungible Token Metadata Field", function () {
        it("should update the metadata of token after signing the transaction with metadata key", async function () {
            this.timeout(120000);

            const operatorId = env.operatorId;
            const metadataKey = PrivateKey.generateED25519();
            const supplyKey = PrivateKey.generateED25519();
            const metadata = new Uint8Array([1]);
            const newMetadata = new Uint8Array([1, 2]);
            let tokenInfo;

            const tokenCreateTx = new TokenCreateTransaction()
                .setTokenName("Test")
                .setTokenSymbol("T")
                .setSupplyKey(supplyKey)
                .setTokenType(TokenType.NonFungibleUnique)
                .setTreasuryAccountId(operatorId)
                .setMetadata(metadata)
                .setMetadataKey(metadataKey);

            const tokenCreateTxresponse = await tokenCreateTx.execute(
                env.client,
            );
            const tokenCreateTxReceipt = await tokenCreateTxresponse.getReceipt(
                env.client,
            );
            const tokenId = tokenCreateTxReceipt.tokenId;

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);
            expect(tokenInfo.metadata).to.eql(metadata);

            const tokenUpdateTx = new TokenUpdateTransaction()
                .setTokenId(tokenId)
                .setMetadata(newMetadata)
                .freezeWith(env.client);

            await (
                await (
                    await tokenUpdateTx.sign(metadataKey)
                ).execute(env.client)
            ).getReceipt(env.client);

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);

            expect(tokenInfo.metadata).to.eql(newMetadata);
        });

        it("should update the metadata of token after signing the transaction with admin key", async function () {
            this.timeout(120000);

            let tokenInfo;
            const operatorId = env.operatorId;
            const adminKey = env.operatorKey;
            const supplyKey = PrivateKey.generateED25519();
            const metadata = new Uint8Array([1]);
            const newMetadata = new Uint8Array([1, 2]);

            const tokenCreateTx = new TokenCreateTransaction()
                .setTokenName("Test")
                .setTokenSymbol("T")
                .setSupplyKey(supplyKey)
                .setTokenType(TokenType.NonFungibleUnique)
                .setTreasuryAccountId(operatorId)
                .setAdminKey(adminKey)
                .setMetadata(metadata);

            const tokenCreateTxresponse = await tokenCreateTx.execute(
                env.client,
            );
            const tokenCreateTxReceipt = await tokenCreateTxresponse.getReceipt(
                env.client,
            );
            const tokenId = tokenCreateTxReceipt.tokenId;

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);
            expect(tokenInfo.metadata).to.eql(metadata);

            const tokenUpdateTx = new TokenUpdateTransaction()
                .setTokenId(tokenId)
                .setMetadata(newMetadata)
                .freezeWith(env.client);

            await (
                await (await tokenUpdateTx.sign(adminKey)).execute(env.client)
            ).getReceipt(env.client);

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);

            expect(tokenInfo.metadata).to.eql(newMetadata);
        });

        it("should NOT update the metadata of token when the new metadata is NOT set", async function () {
            this.timeout(120000);

            let tokenInfo;
            const operatorId = env.operatorId;
            const adminKey = env.operatorKey;
            const supplyKey = PrivateKey.generateED25519();
            const metadata = new Uint8Array([1]);

            const tokenCreateTx = new TokenCreateTransaction()
                .setTokenName("Test")
                .setTokenSymbol("T")
                .setSupplyKey(supplyKey)
                .setTokenType(TokenType.NonFungibleUnique)
                .setTreasuryAccountId(operatorId)
                .setAdminKey(adminKey)
                .setMetadata(metadata);

            const tokenCreateTxresponse = await tokenCreateTx.execute(
                env.client,
            );
            const tokenCreateTxReceipt = await tokenCreateTxresponse.getReceipt(
                env.client,
            );
            const tokenId = tokenCreateTxReceipt.tokenId;

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);
            expect(tokenInfo.metadata).to.eql(metadata);

            const tokenUpdateTx = new TokenUpdateTransaction()
                .setTokenId(tokenId)
                .freezeWith(env.client);

            await (
                await (await tokenUpdateTx.sign(adminKey)).execute(env.client)
            ).getReceipt(env.client);

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);

            expect(tokenInfo.metadata).to.eql(metadata);
        });

        it("should earse the metadata of token after signing the transaction with metadata key", async function () {
            this.timeout(120000);

            const operatorId = env.operatorId;
            const metadataKey = PrivateKey.generateED25519();
            const supplyKey = PrivateKey.generateED25519();
            const metadata = new Uint8Array([1]);
            const newMetadata = new Uint8Array();
            let tokenInfo;

            const tokenCreateTx = new TokenCreateTransaction()
                .setTokenName("Test")
                .setTokenSymbol("T")
                .setSupplyKey(supplyKey)
                .setTokenType(TokenType.NonFungibleUnique)
                .setTreasuryAccountId(operatorId)
                .setMetadata(metadata)
                .setMetadataKey(metadataKey);

            const tokenCreateTxresponse = await tokenCreateTx.execute(
                env.client,
            );
            const tokenCreateTxReceipt = await tokenCreateTxresponse.getReceipt(
                env.client,
            );
            const tokenId = tokenCreateTxReceipt.tokenId;

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);
            expect(tokenInfo.metadata).to.eql(metadata);

            const tokenUpdateTx = new TokenUpdateTransaction()
                .setTokenId(tokenId)
                .setMetadata(newMetadata)
                .freezeWith(env.client);

            await (
                await (
                    await tokenUpdateTx.sign(metadataKey)
                ).execute(env.client)
            ).getReceipt(env.client);

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);

            expect(tokenInfo.metadata).to.eql(newMetadata);
        });

        it("should earse the metadata of token after signing the transaction with admin key", async function () {
            this.timeout(120000);

            const operatorId = env.operatorId;
            const adminKey = env.operatorKey;
            const suppyKey = PrivateKey.generateED25519();
            const metadata = new Uint8Array([1]);
            const newMetadata = new Uint8Array();
            let tokenInfo;

            const tokenCreateTx = new TokenCreateTransaction()
                .setTokenName("Test")
                .setTokenSymbol("T")
                .setSupplyKey(suppyKey)
                .setTokenType(TokenType.NonFungibleUnique)
                .setTreasuryAccountId(operatorId)
                .setAdminKey(adminKey)
                .setMetadata(metadata);

            const tokenCreateTxresponse = await tokenCreateTx.execute(
                env.client,
            );
            const tokenCreateTxReceipt = await tokenCreateTxresponse.getReceipt(
                env.client,
            );
            const tokenId = tokenCreateTxReceipt.tokenId;

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);
            expect(tokenInfo.metadata).to.eql(metadata);

            const tokenUpdateTx = new TokenUpdateTransaction()
                .setTokenId(tokenId)
                .setMetadata(newMetadata)
                .freezeWith(env.client);

            await (
                await (await tokenUpdateTx.sign(adminKey)).execute(env.client)
            ).getReceipt(env.client);

            tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(env.client);

            expect(tokenInfo.metadata).to.eql(newMetadata);
        });

        it("should NOT update the metadata of token when the transaction is not signed with metadata or admin key", async function () {
            this.timeout(120000);

            let status;
            const operatorId = env.operatorId;
            const adminKey = PrivateKey.generateED25519();
            const metadataKey = PrivateKey.generateED25519();
            const wrongKey = PrivateKey.generateED25519();
            const supplyKey = PrivateKey.generateED25519();
            const metadata = new Uint8Array([1]);
            const newMetadata = new Uint8Array([1, 2]);

            try {
                const tokenCreateTx = new TokenCreateTransaction()
                    .setTokenName("Test")
                    .setTokenSymbol("T")
                    .setSupplyKey(supplyKey)
                    .setTokenType(TokenType.NonFungibleUnique)
                    .setTreasuryAccountId(operatorId)
                    .setAdminKey(adminKey)
                    .setMetadata(metadata)
                    .setMetadataKey(metadataKey);

                const tokenCreateTxresponse = await tokenCreateTx.execute(
                    env.client,
                );
                const tokenCreateTxReceipt =
                    await tokenCreateTxresponse.getReceipt(env.client);
                const tokenId = tokenCreateTxReceipt.tokenId;

                const tokenUpdateTx = new TokenUpdateTransaction()
                    .setTokenId(tokenId)
                    .setMetadata(newMetadata)
                    .freezeWith(env.client);

                await (
                    await (
                        await tokenUpdateTx.sign(wrongKey)
                    ).execute(env.client)
                ).getReceipt(env.client);
            } catch (error) {
                status = error.status;
            }
            expect(status).to.be.eql(Status.InvalidSignature);
        });

        it("should NOT update the metadata of token if the metadata or admin keys are NOT set", async function () {
            this.timeout(120000);

            let status;
            const operatorId = env.operatorId;
            const supplyKey = PrivateKey.generateED25519();
            const metadata = new Uint8Array([1]);
            const newMetadata = new Uint8Array([1, 2]);

            try {
                const tokenCreateTx = new TokenCreateTransaction()
                    .setTokenName("Test")
                    .setTokenSymbol("T")
                    .setSupplyKey(supplyKey)
                    .setTokenType(TokenType.NonFungibleUnique)
                    .setTreasuryAccountId(operatorId)
                    .setMetadata(metadata);

                const tokenCreateTxresponse = await tokenCreateTx.execute(
                    env.client,
                );
                const tokenCreateTxReceipt =
                    await tokenCreateTxresponse.getReceipt(env.client);
                const tokenId = tokenCreateTxReceipt.tokenId;

                const tokenUpdateTx = new TokenUpdateTransaction()
                    .setTokenId(tokenId)
                    .setMetadata(newMetadata)
                    .freezeWith(env.client);

                await (
                    await tokenUpdateTx.execute(env.client)
                ).getReceipt(env.client);
            } catch (error) {
                status = error.status;
            }
            expect(status).to.be.eql(Status.TokenIsImmutable);
        });
    });

    after(function () {
        if (env != null) {
            env.close();
        }
    });
});
