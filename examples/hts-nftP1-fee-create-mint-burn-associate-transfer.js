import {
    AccountId,
    PrivateKey,
    Client,
    TokenCreateTransaction,
    TokenInfoQuery,
    TokenType,
    CustomRoyaltyFee,
    CustomFixedFee,
    Hbar,
    TokenSupplyType,
    TokenMintTransaction,
    TokenBurnTransaction,
    TransferTransaction,
    AccountBalanceQuery,
    AccountUpdateTransaction,
    TokenAssociateTransaction,
} from "@hashgraph/sdk";

/**
 * @typedef {import("@hashgraph/sdk").TokenInfo} TokenInfo
 * @typedef {import("@hashgraph/sdk").TransactionReceipt} TransactionReceipt
 */

import dotenv from "dotenv";

dotenv.config();

// Configure accounts and client, and generate needed keys
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const treasuryId = AccountId.fromString(process.env.TREASURY_ID);
const treasuryKey = PrivateKey.fromString(process.env.TREASURY_PVKEY);
const aliceId = AccountId.fromString(process.env.ALICE_ID);
const aliceKey = PrivateKey.fromString(process.env.ALICE_PVKEY);
const bobId = AccountId.fromString(process.env.BOB_ID);
const bobKey = PrivateKey.fromString(process.env.BOB_PVKEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const supplyKey = PrivateKey.generate();
const adminKey = PrivateKey.generate();
const freezeKey = PrivateKey.generate();
const wipeKey = PrivateKey.generate();

async function main() {
    // DEFINE CUSTOM FEE SCHEDULE
    let nftCustomFee = new CustomRoyaltyFee()
        .setNumerator(5)
        .setDenominator(10)
        .setFeeCollectorAccountId(treasuryId)
        .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(200)));

    // IPFS CONTENT IDENTIFIERS FOR WHICH WE WILL CREATE NFTs
    const CID = [
        "QmNPCiNA3Dsu3K5FxDPMG5Q3fZRwVTg14EXA92uqEeSRXn",
        "QmZ4dgAgt8owvnULxnKxNe8YqpavtVCXmc1Lt2XajFpJs9",
        "QmPzY5GxevjyfMUF5vEAjtyRoigzWp47MiKAtLBduLMC1T",
        "Qmd3kGgSrAwwSrhesYcY7K54f3qD7MDo38r7Po2dChtQx5",
        "QmWgkKz3ozgqtnvbCLeh7EaR1H8u5Sshx3ZJzxkcrT3jbw",
    ];

    // CREATE NFT WITH CUSTOM FEE
    let nftCreate = await new TokenCreateTransaction()
        .setTokenName("Fall Collection")
        .setTokenSymbol("LEAF")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(treasuryId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(CID.length)
        .setCustomFees([nftCustomFee])
        .setAdminKey(adminKey)
        .setSupplyKey(supplyKey)
        // .setPauseKey(pauseKey)
        .setFreezeKey(freezeKey)
        .setWipeKey(wipeKey)
        .freezeWith(client)
        .sign(treasuryKey);

    let nftCreateTxSign = await nftCreate.sign(adminKey);
    let nftCreateSubmit = await nftCreateTxSign.execute(client);
    let nftCreateRx = await nftCreateSubmit.getReceipt(client);
    let tokenId = nftCreateRx.tokenId;
    console.log(`Created NFT with Token ID: ${tokenId.toString()} \n`);

    // TOKEN QUERY TO CHECK THAT THE CUSTOM FEE SCHEDULE IS ASSOCIATED WITH NFT
    var tokenInfo = await new TokenInfoQuery()
        .setTokenId(tokenId)
        .execute(client);
    console.table(tokenInfo.customFees[0]);

    // MINT NEW BATCH OF NFTs
    const nftLeaf = [];
    for (var i = 0; i < CID.length; i++) {
        nftLeaf[i] = await tokenMinterFcn(CID[i]);
        console.log(
            `Created NFT ${tokenId.toString()} with serial: ${nftLeaf[
                i
            ].serials[0].toString()}`
        );
    }

    // BURN THE LAST NFT IN THE COLLECTION
    let tokenBurnTx = await new TokenBurnTransaction()
        .setTokenId(tokenId)
        .setSerials([CID.length])
        .freezeWith(client)
        .sign(supplyKey);
    let tokenBurnSubmit = await tokenBurnTx.execute(client);
    let tokenBurnRx = await tokenBurnSubmit.getReceipt(client);
    console.log(
        `\nBurn NFT with serial ${
            CID.length
        }: ${tokenBurnRx.status.toString()} \n`
    );

    tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
    console.log(`Current NFT supply: ${tokenInfo.totalSupply.toString()} \n`);

    // AUTO-ASSOCIATION FOR ALICE'S ACCOUNT
    let associateTx = await new AccountUpdateTransaction()
        .setAccountId(aliceId)
        .setMaxAutomaticTokenAssociations(100)
        .freezeWith(client)
        .sign(aliceKey);
    let associateTxSubmit = await associateTx.execute(client);
    let associateRx = await associateTxSubmit.getReceipt(client);
    console.log(
        `Alice NFT Auto-Association: ${associateRx.status.toString()} \n`
    );

    // MANUAL ASSOCIATION FOR BOB'S ACCOUNT
    let associateBobTx = await new TokenAssociateTransaction()
        .setAccountId(bobId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(bobKey);
    let associateBobTxSubmit = await associateBobTx.execute(client);
    let associateBobRx = await associateBobTxSubmit.getReceipt(client);
    console.log(
        `Bob NFT Manual Association: ${associateBobRx.status.toString()} \n`
    );

    // BALANCE CHECK 1
    let oB = await bCheckerFcn(treasuryId);
    let aB = await bCheckerFcn(aliceId);
    let bB = await bCheckerFcn(bobId);
    console.log(
        `- Treasury balance: ${oB[0].toString()} NFTs of ID:${tokenId.toString()} and ${oB[1].toString()}`
    );
    console.log(
        `- Alice balance: ${aB[0].toString()} NFTs of ID:${tokenId.toString()} and ${aB[1].toString()}`
    );
    console.log(
        `- Bob balance: ${bB[0].toString()} NFTs of ID:${tokenId.toString()} and ${bB[1].toString()}`
    );

    // 1st TRANSFER NFT Treasury->Alice
    let tokenTransferTx = await new TransferTransaction()
        .addNftTransfer(tokenId, 2, treasuryId, aliceId)
        .freezeWith(client)
        .sign(treasuryKey);
    let tokenTransferSubmit = await tokenTransferTx.execute(client);
    let tokenTransferRx = await tokenTransferSubmit.getReceipt(client);
    console.log(
        `\n NFT transfer Treasury->Alice status: ${tokenTransferRx.status.toString()} \n`
    );

    // BALANCE CHECK 2
    oB = await bCheckerFcn(treasuryId);
    aB = await bCheckerFcn(aliceId);
    bB = await bCheckerFcn(bobId);
    console.log(
        `- Treasury balance: ${oB[0].toString()} NFTs of ID:${tokenId.toString()} and ${oB[1].toString()}`
    );
    console.log(
        `- Alice balance: ${aB[0].toString()} NFTs of ID:${tokenId.toString()} and ${aB[1].toString()}`
    );
    console.log(
        `- Bob balance: ${bB[0].toString()} NFTs of ID:${tokenId.toString()} and ${bB[1].toString()}`
    );

    // 2nd NFT TRANSFER NFT Alice->Bob
    let tokenTransferTx2 = await new TransferTransaction()
        .addNftTransfer(tokenId, 2, aliceId, bobId)
        .addHbarTransfer(aliceId, 100)
        .addHbarTransfer(bobId, -100)
        .freezeWith(client)
        .sign(aliceKey);
    const tokenTransferTx2Sign = await tokenTransferTx2.sign(bobKey);
    let tokenTransferSubmit2 = await tokenTransferTx2Sign.execute(client);
    let tokenTransferRx2 = await tokenTransferSubmit2.getReceipt(client);
    console.log(
        `\n NFT transfer Alice->Bob status: ${tokenTransferRx2.status.toString()} \n`
    );

    // BALANCE CHECK 3
    oB = await bCheckerFcn(treasuryId);
    aB = await bCheckerFcn(aliceId);
    bB = await bCheckerFcn(bobId);
    console.log(
        `- Treasury balance: ${oB[0].toString()} NFTs of ID:${tokenId.toString()} and ${oB[1].toString()}`
    );
    console.log(
        `- Alice balance: ${aB[0].toString()} NFTs of ID:${tokenId.toString()} and ${aB[1].toString()}`
    );
    console.log(
        `- Bob balance: ${bB[0].toString()} NFTs of ID:${tokenId.toString()} and ${bB[1].toString()}`
    );

    /**
     * TOKEN MINTER FUNCTION
     *
     * @param {string} CID
     * @returns {Promise<TransactionReceipt>}
     */
    async function tokenMinterFcn(CID) {
        const mintTx = new TokenMintTransaction()
            .setTokenId(tokenId)
            .setMetadata([Buffer.from(CID)])
            .freezeWith(client);
        let mintTxSign = await mintTx.sign(supplyKey);
        let mintTxSubmit = await mintTxSign.execute(client);
        return mintTxSubmit.getReceipt(client);
    }

    // BALANCE CHECKER FUNCTION ==========================================
    /**
     * BALANCE CHECKER FUNCTION
     *
     * @param {string | AccountId} id
     * @returns {Promise<[Long, Hbar]>}
     */
    async function bCheckerFcn(id) {
        const balanceCheckTx = await new AccountBalanceQuery()
            .setAccountId(id)
            .execute(client);
        return [
            balanceCheckTx.tokens._map.get(tokenId.toString()),
            balanceCheckTx.hbars,
        ];
    }
}

void main();
