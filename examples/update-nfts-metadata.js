import { TokenCreateTransaction, TokenInfoQuery, TokenType, PrivateKey, Client, AccountId, TokenMintTransaction, TokenNftsUpdateTransaction } from "@hashgraph/sdk";
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
    const network = process.env.HEDERA_NETWORK
    const client = Client.forName(network).setOperator(operatorId, operatorKey);
    const metadataKey = PrivateKey.generateECDSA()
    console.log(`Generated metadata key: ${metadataKey.toString()}`);

    // Set initial metadate
    const metadata = new Uint8Array(1)
    // Set updated metadate
    const updatedMetadata = new Uint8Array(2)

    try {
        // Create token
        let createTokenTx = new TokenCreateTransaction()
            .setTokenName("Test")
            .setTokenSymbol("T")
            .setTokenType(TokenType.NonFungibleUnique)
            .setTreasuryAccountId(operatorId)
            .setAdminKey(operatorKey)
            .setTreasuryAccountId(operatorId)
            .setSupplyKey(operatorKey)
            .setMetadataKey(metadataKey)
            .freezeWith(client)

        const tokenCreateResponse = await (await createTokenTx.sign(operatorKey)).execute(client)
        // Get receipt for create token transaction
        const tokenCreateReceipt = await tokenCreateResponse.getReceipt(client);
        console.log(`Status of token create transction: ${tokenCreateReceipt.status.toString()}`);

        const tokenId = tokenCreateReceipt.tokenId;
        console.log(`Token id: ${tokenId.toString()}`);

        // Get token info
        const tokenInfo = await new TokenInfoQuery()
            .setTokenId(tokenId)
            .execute(client);
        console.log(`Token metadata key: ${tokenInfo.metadataKey.toString()}`);

        // Mint token
        const tokenMintTx = new TokenMintTransaction()
            .setMetadata([metadata])
            .setTokenId(tokenId)
        console.log(`Set metadata: ${tokenMintTx.metadata}`);

        const tokenMintResponse = await tokenMintTx.execute(client);
        // Get receipt for mint token transaction
        const tokenMintReceipt = await tokenMintResponse.getReceipt(client);
        console.log(`Status of token mint transction: ${tokenMintReceipt.status.toString()}`);

        // Update nfts metadata
        const tokenUpdateNftsTx = new TokenNftsUpdateTransaction()
            .setTokenId(tokenId)
            .setSerialNumbers(tokenMintReceipt.serials)
            .setMetadata(updatedMetadata)
            .freezeWith(client)
        console.log(`Updatetd metadata: ${tokenUpdateNftsTx.metadata}`);

        const tokenUpdateNftsResponse = await(await tokenUpdateNftsTx.sign(metadataKey)).execute(client)
        // Get receipt for update nfts metadata transaction
        const tokenUpdateNftsReceipt = await tokenUpdateNftsResponse.getReceipt(client);
        console.log(`Status of token update bfts metadata transction: ${tokenUpdateNftsReceipt.status.toString()}`);
    } catch(error){
        console.log(error);
    }

    client.close()
}

void main();
