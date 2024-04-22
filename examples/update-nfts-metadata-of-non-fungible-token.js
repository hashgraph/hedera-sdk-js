import {
    TokenCreateTransaction,
    TokenInfoQuery,
    TokenType,
    PrivateKey,
    Client,
    AccountId,
    TokenMintTransaction,
    TokenNftsUpdateTransaction,
    TokenNftInfoQuery,
    NftId,
    AccountCreateTransaction,
    Hbar,
    TransferTransaction,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

/**
 * @notice E2E-HIP-657
 * @url https://hips.hedera.com/hip/hip-657
 */
async function main() {
    if (
        !process.env.OPERATOR_KEY ||
        !process.env.OPERATOR_ID ||
        !process.env.HEDERA_NETWORK
    ) {
        throw new Error("Please set required keys in .env file.");
    }

    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorKey = PrivateKey.fromStringDer(process.env.OPERATOR_KEY);
    const network = process.env.HEDERA_NETWORK;
    const client = Client.forName(network).setOperator(operatorId, operatorKey);

    // Generate a metadata key
    const metadataKey = PrivateKey.generateED25519();
    // Generate a metadata key
    const supplyKey = PrivateKey.generateED25519();
    // Initial metadata
    const metadata = new Uint8Array([1]);
    // New metadata
    const newMetadata = new Uint8Array([1, 2]);

    let tokenNftsInfo, nftInfo;

    try {
        // Create a non fungible token
        let createTokenTx = new TokenCreateTransaction()
            .setTokenName("Test")
            .setTokenSymbol("T")
            .setTokenType(TokenType.NonFungibleUnique)
            .setTreasuryAccountId(operatorId)
            .setSupplyKey(supplyKey)
            .setMetadataKey(metadataKey)
            .freezeWith(client);

        // Sign and execute create token transaction
        const tokenCreateTxResponse = await (
            await createTokenTx.sign(operatorKey)
        ).execute(client);

        // Get receipt for create token transaction
        const tokenCreateTxReceipt =
            await tokenCreateTxResponse.getReceipt(client);
        console.log(
            `Status of token create transction: ${tokenCreateTxReceipt.status.toString()}`,
        );

        // Get token id
        const tokenId = tokenCreateTxReceipt.tokenId;
        console.log(`Token id: ${tokenId.toString()}`);

        // Get token info
        const tokenInfo = await new TokenInfoQuery()
            .setTokenId(tokenId)
            .execute(client);
        console.log(`Token metadata key: ${tokenInfo.metadataKey?.toString()}`);

        // Mint token
        const tokenMintTx = new TokenMintTransaction()
            .setMetadata([metadata])
            .setTokenId(tokenId)
            .freezeWith(client);

        const tokenMintTxResponse = await (
            await tokenMintTx.sign(supplyKey)
        ).execute(client);
        const tokenMintTxReceipt = await tokenMintTxResponse.getReceipt(client);
        console.log(
            `Status of token mint transction: ${tokenMintTxReceipt.status.toString()}`,
        );

        const nftSerial = tokenMintTxReceipt.serials[0];

        // Get TokenNftInfo to show the metadata on the NFT created
        tokenNftsInfo = await new TokenNftInfoQuery()
            .setNftId(new NftId(tokenId, nftSerial))
            .execute(client);
        nftInfo = tokenNftsInfo[0];
        console.log(`Set token NFT metadata:`, nftInfo.metadata);

        // Create an account with 10 automatic token association slots to transfer the NFT to
        const accountCreateTx = new AccountCreateTransaction()
            .setKey(operatorKey)
            .setMaxAutomaticTokenAssociations(10) // If the account does not have any automatic token association slots open ONLY then associate the NFT to the account
            .setInitialBalance(new Hbar(100))
            .freezeWith(client);

        const accountCreateTxResponse = await (
            await accountCreateTx.sign(operatorKey)
        ).execute(client);
        const accountCreateTxReceipt =
            await accountCreateTxResponse.getReceipt(client);
        const newAccountId = accountCreateTxReceipt.accountId;
        console.log(`New account id: ${newAccountId.toString()}`);

        // Transfer nft to the new account
        const transferNftTx = new TransferTransaction()
            .addNftTransfer(tokenId, nftSerial, operatorId, newAccountId)
            .freezeWith(client);

        const transferNftTxResponse = await (
            await transferNftTx.sign(operatorKey)
        ).execute(client);
        const transferNftTxReceipt =
            await transferNftTxResponse.getReceipt(client);
        console.log(
            `Status of transfer NFT transaction: ${transferNftTxReceipt.status.toString()}`,
        );

        // Update nfts metadata
        const tokenUpdateNftsTx = new TokenNftsUpdateTransaction()
            .setTokenId(tokenId)
            .setSerialNumbers([nftSerial])
            .setMetadata(newMetadata)
            .freezeWith(client);

        const tokenUpdateNftsTxResponse = await (
            await tokenUpdateNftsTx.sign(metadataKey)
        ).execute(client);
        const tokenUpdateNftsTxReceipt =
            await tokenUpdateNftsTxResponse.getReceipt(client);
        console.log(
            `Status of token update nfts transction: ${tokenUpdateNftsTxReceipt.status.toString()}`,
        );

        // Get token nfts info in order to show the metadata on the NFT created
        tokenNftsInfo = await new TokenNftInfoQuery()
            .setNftId(new NftId(tokenId, nftSerial))
            .execute(client);
        nftInfo = tokenNftsInfo[0];
        console.log(`Updated token NFT metadata:`, nftInfo.metadata);
    } catch (error) {
        console.log(error);
    }

    client.close();
}

void main();
