import {
    AccountCreateTransaction,
    PrivateKey,
    TokenCreateTransaction,
    TransferTransaction,
    AccountId,
    Client,
    TokenType,
    TokenMintTransaction,
    TokenRejectTransaction,
    TokenRejectFlow,
    NftId,
    AccountBalanceQuery,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    if (
        process.env.OPERATOR_ID == null ||
        process.env.OPERATOR_KEY == null ||
        process.env.HEDERA_NETWORK == null
    ) {
        throw new Error(
            "Environment variables OPERATOR_ID, HEDERA_NETWORK, and OPERATOR_KEY are required.",
        );
    }

    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_KEY);
    const network = process.env.HEDERA_NETWORK;
    const client = Client.forName(network).setOperator(operatorId, operatorKey);

    // generate treasury account
    const treasuryPrivateKey = PrivateKey.generateED25519();
    const treasuryAccountId = (
        await (
            await new AccountCreateTransaction()
                .setKey(treasuryPrivateKey)
                .setMaxAutomaticTokenAssociations(-1)
                .execute(client)
        ).getReceipt(client)
    ).accountId;

    // generate receiver account
    const receiverPrivateKey = PrivateKey.generateED25519();
    const receiverAccountId = (
        await (
            await new AccountCreateTransaction()
                .setKey(receiverPrivateKey)
                .setMaxAutomaticTokenAssociations(-1)
                .execute(client)
        ).getReceipt(client)
    ).accountId;

    // generate nft collection
    const nftCreationTx = await (
        await new TokenCreateTransaction()
            .setTokenType(TokenType.NonFungibleUnique)
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setSupplyKey(operatorKey)
            .setAdminKey(operatorKey)
            .setTreasuryAccountId(treasuryAccountId)
            .freezeWith(client)
            .sign(treasuryPrivateKey)
    ).execute(client);

    const nftId = (await nftCreationTx.getReceipt(client)).tokenId;
    console.log("NFT ID: ", nftId.toString());

    // generate fungible token
    const ftCreationTx = await (
        await new TokenCreateTransaction()
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setInitialSupply(100000000)
            .setSupplyKey(operatorKey)
            .setAdminKey(operatorKey)
            .setTreasuryAccountId(treasuryAccountId)
            .freezeWith(client)
            .sign(treasuryPrivateKey)
    ).execute(client);

    const ftId = (await ftCreationTx.getReceipt(client)).tokenId;
    console.log("FT ID: ", ftId.toString());

    // mint 3 NFTs to treasury
    const nftSerialIds = [];
    for (let i = 0; i < 3; i++) {
        const { serials } = await (
            await new TokenMintTransaction()
                .setTokenId(nftId)
                .addMetadata(Buffer.from("-"))
                .execute(client)
        ).getReceipt(client);
        const [serial] = serials;
        nftSerialIds.push(new NftId(nftId, serial));
    }

    // transfer nfts to receiver
    await (
        await (
            await new TransferTransaction()
                .addNftTransfer(
                    nftSerialIds[0],
                    treasuryAccountId,
                    receiverAccountId,
                )
                .addNftTransfer(
                    nftSerialIds[1],
                    treasuryAccountId,
                    receiverAccountId,
                )
                .addNftTransfer(
                    nftSerialIds[2],
                    treasuryAccountId,
                    receiverAccountId,
                )
                .freezeWith(client)
                .sign(treasuryPrivateKey)
        ).execute(client)
    ).getReceipt(client);

    // transfer fungible tokens to receiver
    await (
        await (
            await new TransferTransaction()
                .addTokenTransfer(ftId, treasuryAccountId, -1)
                .addTokenTransfer(ftId, receiverAccountId, 1)
                .freezeWith(client)
                .sign(treasuryPrivateKey)
        ).execute(client)
    ).getReceipt(client);

    // reject fungible tokens back to treasury
    const tokenRejectResponse = await (
        await (
            await new TokenRejectTransaction()
                .setOwnerId(receiverAccountId)
                .addTokenId(ftId)
                .freezeWith(client)
                .sign(receiverPrivateKey)
        ).execute(client)
    ).getReceipt(client);

    // reject NFTs back to treasury
    const rejectFlowResponse = await (
        await (
            await new TokenRejectFlow()
                .setOwnerId(receiverAccountId)
                .setNftIds(nftSerialIds)
                .freezeWith(client)
                .sign(receiverPrivateKey)
        ).execute(client)
    ).getReceipt(client);

    const tokenRejectStatus =
        tokenRejectResponse.status._code == 22 ? "Success" : "Fail";
    const tokenRejectFlowStatus =
        rejectFlowResponse.status._code == 22 ? "Success" : "Fail";

    console.log("TokenReject response:", tokenRejectStatus);
    console.log("TokenRejectFlow response:", tokenRejectFlowStatus);

    const receiverFTBalance = (
        await new AccountBalanceQuery()
            .setAccountId(receiverAccountId)
            .execute(client)
    ).tokens.get(ftId);

    const treasuryFTBalance = (
        await new AccountBalanceQuery()
            .setAccountId(treasuryAccountId)
            .execute(client)
    ).tokens.get(ftId);

    const receiverNFTBalance = (
        await new AccountBalanceQuery()
            .setAccountId(receiverAccountId)
            .execute(client)
    ).tokens.get(nftId);

    const treasuryNFTBalance = (
        await new AccountBalanceQuery()
            .setAccountId(treasuryAccountId)
            .execute(client)
    ).tokens.get(nftId);

    console.log("Receiver FT balance: ", receiverFTBalance.toInt());
    console.log("Treasury FT balance: ", treasuryFTBalance.toInt());

    console.log(
        "Receiver NFT balance: ",
        receiverNFTBalance ? receiverNFTBalance.toInt() : 0,
    );
    console.log("Treasury NFT balance: ", treasuryNFTBalance.toInt());

    client.close();
}

void main();
