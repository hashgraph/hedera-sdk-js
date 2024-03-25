import {
    TokenCreateTransaction,
    TokenInfoQuery,
    TokenType,
    PrivateKey,
    TransactionReceipt,
    TransactionResponse,
    TokenMintTransaction,
    TokenNftsUpdateTransaction,
    Status,
    TokenNftInfoQuery,
    NftId,
    TokenNftInfo,
} from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("TokenNftsUpdateTransaction", function () {
    let client,
        operatorId,
        operatorKey,
        metadata,
        newMetadata,
        metadataKey,
        tokenName,
        tokenSymbol,
        supplyKey,
        tokenNftsInfo,
        nftInfo,
        wrongMetadataKey;

    before(async function () {
        const env = await IntegrationTestEnv.new();
        client = env.client;
        operatorId = env.operatorId;
        operatorKey = env.operatorKey;
        metadata = new Uint8Array([1]);
        newMetadata = new Uint8Array([1, 2]);
        metadataKey = PrivateKey.generateECDSA();
        supplyKey = PrivateKey.generateECDSA();
        tokenName = "Test";
        tokenSymbol = "T";
        wrongMetadataKey = PrivateKey.generateECDSA();
    });

    it("should update the NFT metadata", async function () {
        this.timeout(120000);
        try {
            const createTokenTx = new TokenCreateTransaction()
                .setTokenName(tokenName)
                .setTokenSymbol(tokenSymbol)
                .setMetadata(metadata)
                .setAdminKey(operatorKey)
                .setSupplyKey(supplyKey)
                .setMetadataKey(metadataKey)
                .setTreasuryAccountId(operatorId)
                .setTokenType(TokenType.NonFungibleUnique);
            expect(createTokenTx.tokenName).to.be.eql(tokenName);
            expect(createTokenTx.tokenSymbol).to.be.eql(tokenSymbol);
            expect(createTokenTx.metadata).to.be.eql(metadata);
            expect(createTokenTx.metadataKey.toString()).to.be.eql(
                metadataKey.toString(),
            );
            expect(createTokenTx.treasuryAccountId.toString()).to.be.eql(
                operatorId.toString(),
            );
            expect(createTokenTx.tokenType).to.be.eql(
                TokenType.NonFungibleUnique,
            );
            expect(createTokenTx.adminKey.toString()).to.be.eql(
                operatorKey.toString(),
            );
            expect(createTokenTx.supplyKey.toString()).to.be.eql(
                supplyKey.toString(),
            );

            const createTokenTxResponse = await createTokenTx.execute(client);
            expect(createTokenTxResponse).to.be.instanceof(TransactionResponse);
            const createTokenTxReceipt =
                await createTokenTxResponse.getReceipt(client);
            expect(createTokenTxReceipt).to.be.instanceof(TransactionReceipt);
            expect(createTokenTxReceipt.status).to.be.eql(Status.Success);
            const tokenId = createTokenTxReceipt.tokenId;
            expect(tokenId).to.not.be.null;

            const tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(client);
            expect(tokenInfo.metadata).to.be.eql(metadata);

            const tokenMintTx = new TokenMintTransaction()
                .setMetadata([metadata])
                .setTokenId(tokenId)
                .freezeWith(client);

            const tokenMintResponse = await (
                await tokenMintTx.sign(supplyKey)
            ).execute(client);
            expect(tokenMintResponse).to.be.instanceof(TransactionResponse);
            const tokenMintReceipt = await tokenMintResponse.getReceipt(client);
            expect(tokenMintReceipt).to.be.instanceof(TransactionReceipt);
            expect(tokenMintReceipt.status).to.be.eql(Status.Success);

            const nftSerial = tokenMintReceipt.serials[0];
            const nftId = new NftId(tokenId, nftSerial);

            tokenNftsInfo = await new TokenNftInfoQuery()
                .setNftId(nftId)
                .execute(client);
            nftInfo = tokenNftsInfo[0];
            expect(nftInfo).to.be.instanceof(TokenNftInfo);
            expect(nftInfo.metadata).to.be.eql(metadata);

            const tokenUpdateNftsTx = new TokenNftsUpdateTransaction()
                .setTokenId(tokenId)
                .setSerialNumbers([nftSerial])
                .setMetadata(newMetadata)
                .freezeWith(client);

            const tokenUpdateNftsResponse = await (
                await tokenUpdateNftsTx.sign(metadataKey)
            ).execute(client);
            expect(tokenUpdateNftsResponse).to.be.instanceof(
                TransactionResponse,
            );
            const tokenUpdateNftsReceipt =
                await tokenUpdateNftsResponse.getReceipt(client);
            expect(tokenUpdateNftsReceipt).to.be.instanceof(TransactionReceipt);
            expect(tokenUpdateNftsReceipt.status).to.be.eql(Status.Success);

            tokenNftsInfo = await new TokenNftInfoQuery()
                .setNftId(new NftId(tokenId, nftSerial))
                .execute(client);
            nftInfo = tokenNftsInfo[0];
            expect(nftInfo.metadata).to.be.eql(newMetadata);
        } catch (error) {
            console.warn(error);
        }
    });

    it("cannot update the NFT metadata if the metadataKey is missing", async function () {
        this.timeout(120000);
        try {
            const createTokenTx = new TokenCreateTransaction()
                .setTokenName(tokenName)
                .setTokenSymbol(tokenSymbol)
                .setMetadata(metadata)
                .setAdminKey(operatorKey)
                .setSupplyKey(supplyKey)
                .setTreasuryAccountId(operatorId)
                .setTokenType(TokenType.NonFungibleUnique);

            const createTokenTxResponse = await createTokenTx.execute(client);
            const createTokenTxReceipt =
                await createTokenTxResponse.getReceipt(client);
            const tokenId = createTokenTxReceipt.tokenId;

            const tokenMintTx = new TokenMintTransaction()
                .setMetadata([metadata])
                .setTokenId(tokenId)
                .freezeWith(client);

            const tokenMintResponse = await (
                await tokenMintTx.sign(supplyKey)
            ).execute(client);
            const tokenMintReceipt = await tokenMintResponse.getReceipt(client);

            const nftSerial = tokenMintReceipt.serials[0];
            const nftId = new NftId(tokenId, nftSerial);

            tokenNftsInfo = await new TokenNftInfoQuery()
                .setNftId(nftId)
                .execute(client);
            nftInfo = tokenNftsInfo[0];

            const tokenUpdateNftsTx = new TokenNftsUpdateTransaction()
                .setTokenId(tokenId)
                .setSerialNumbers([nftSerial])
                .setMetadata(newMetadata)
                .freezeWith(client);

            const tokenUpdateTxResponse = await (
                await tokenUpdateNftsTx.sign(metadataKey)
            ).execute(client);
            await tokenUpdateTxResponse.getReceipt(client);
        } catch (error) {
            expect(error.status).to.be.eql(Status.TokenHasNoMetadataKey);
        }
    });

    it("cannot update the NFT metadata when the transaction is not signed with metadataKey", async function () {
        this.timeout(120000);
        try {
            const createTokenTx = new TokenCreateTransaction()
                .setTokenName(tokenName)
                .setTokenSymbol(tokenSymbol)
                .setMetadata(metadata)
                .setAdminKey(operatorKey)
                .setMetadataKey(metadataKey)
                .setSupplyKey(supplyKey)
                .setTreasuryAccountId(operatorId)
                .setTokenType(TokenType.NonFungibleUnique);

            const createTokenTxResponse = await createTokenTx.execute(client);
            const createTokenTxReceipt =
                await createTokenTxResponse.getReceipt(client);
            const tokenId = createTokenTxReceipt.tokenId;

            const tokenMintTx = new TokenMintTransaction()
                .setMetadata([metadata])
                .setTokenId(tokenId)
                .freezeWith(client);

            const tokenMintResponse = await (
                await tokenMintTx.sign(supplyKey)
            ).execute(client);
            const tokenMintReceipt = await tokenMintResponse.getReceipt(client);

            const nftSerial = tokenMintReceipt.serials[0];

            const tokenUpdateNftsTx = new TokenNftsUpdateTransaction()
                .setTokenId(tokenId)
                .setSerialNumbers([nftSerial])
                .setMetadata(newMetadata)
                .freezeWith(client);

            await (
                await (
                    await tokenUpdateNftsTx.sign(wrongMetadataKey)
                ).execute(client)
            ).getReceipt(client);
        } catch (error) {
            expect(error.status).to.be.eql(Status.InvalidSignature);
        }
    });
});
