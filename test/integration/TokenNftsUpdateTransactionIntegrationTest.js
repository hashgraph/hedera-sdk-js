import {
    TokenCreateTransaction,
    TokenInfoQuery,
    TokenType,
    PrivateKey,
    TransactionReceipt,
    TransactionResponse,
    TokenMintTransaction,
    TokenNftsUpdateTransaction,
    TokenId,
    TokenInfo,
} from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("TokenNftsUpdateTransaction", function () {
    let client, operatorId, operatorKey;

    before(async function () {
        const env = await IntegrationTestEnv.new();
        client = env.client;
        operatorId = env.operatorId;
        operatorKey = env.operatorKey;
    });

    it("should update the inital metadata of nfts", async function () {
        const metadataKey = PrivateKey.generateECDSA();
        const metadata = new Uint8Array(1);
        const newMetadata = new Uint8Array(2);

        try {
            let createTokenTx = new TokenCreateTransaction()
                .setTokenName("Test")
                .setTokenSymbol("T")
                .setTokenType(TokenType.NonFungibleUnique)
                .setTreasuryAccountId(operatorId)
                .setAdminKey(operatorKey)
                .setTreasuryAccountId(operatorId)
                .setSupplyKey(operatorKey)
                .setMetadataKey(metadataKey)
                .freezeWith(client);
            expect(createTokenTx.tokenName).to.be.equal("Test");
            expect(createTokenTx.tokenSymbol).to.be.equal("T");
            expect(createTokenTx.tokenType).to.be.equal(
                TokenType.NonFungibleUnique,
            );
            expect(createTokenTx.treasuryAccountId.toString()).to.be.equal(
                operatorId.toString(),
            );
            expect(createTokenTx.adminKey.toString()).to.be.equal(
                operatorKey.toString(),
            );
            expect(createTokenTx.supplyKey.toString()).to.be.equal(
                operatorKey.toString(),
            );
            expect(createTokenTx.metadataKey.toString()).to.be.equal(
                metadataKey.toString(),
            );

            const createTokenResponse = await (
                await createTokenTx.sign(operatorKey)
            ).execute(client);
            expect(createTokenResponse).to.be.instanceof(TransactionResponse);

            const createTokenReceipt =
                await createTokenResponse.getReceipt(client);
            expect(createTokenReceipt).to.be.instanceof(TransactionReceipt);

            const tokenId = createTokenReceipt.tokenId;
            expect(tokenId).to.be.instanceof(TokenId);

            const tokenInfo = await new TokenInfoQuery()
                .setTokenId(tokenId)
                .execute(client);
            expect(tokenInfo).to.be.instanceof(TokenInfo);

            const tokenMintTx = new TokenMintTransaction()
                .setMetadata([metadata])
                .setTokenId(tokenId);

            const tokenMintResponse = await tokenMintTx.execute(client);
            expect(tokenMintResponse).to.be.instanceof(TransactionResponse);

            const tokenMintReceipt = await tokenMintResponse.getReceipt(client);
            expect(tokenMintReceipt).to.be.instanceof(TransactionReceipt);

            const tokenUpdateNftsTx = new TokenNftsUpdateTransaction()
                .setTokenId(tokenId)
                .setSerialNumbers(tokenMintReceipt.serials)
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
        } catch (error) {
            console.log(error);
        }
    });

    it("should return INVALID_METADATA_KEY error", async function () {});
    it("should return TOKEN_HAS_NO_METADATA_KEY error", async function () {});
    it("should return MISSING_TOKEN_METADATA error", async function () {});
    it("should return MISSING_SERIAL_NUMBERS error", async function () {});
});
