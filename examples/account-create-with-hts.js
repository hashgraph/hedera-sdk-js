import {
    AccountId,
    PrivateKey,
    Client,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenMintTransaction,
    TransferTransaction,
    AccountBalanceQuery,
    TokenNftInfoQuery,
    NftId
} from "@hashgraph/sdk";
import { expect } from "chai";

/**
 * @typedef {import("@hashgraph/sdk").TokenInfo} TokenInfo
 * @typedef {import("@hashgraph/sdk").TransactionReceipt} TransactionReceipt
 */

import dotenv from "dotenv";

dotenv.config();


/*
Example for HIP-542.

## Example 1:

### Steps
1. Create an NFT using the Hedera Token Service
2. Mint the NFT
3. Create an ECDSA public key alias
4. Tranfer the NFT to the public key alias using the transfer transaction
5. Return the new account ID in the child record
6. Show the new account ID owns the NFT

## Example 2:
### Steps
1. Create a fungible HTS token using the Hedera Token Service
2. Create an ECDSA public key alias
3. Transfer the fungible token to the public key alias
4. Return the new account ID in the child record
5. Show the new account ID owns the fungible token

*/

async function main() {
    
    // Configure accounts and client, and generate needed keys
    //const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    //const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PRIVATE_KEY);
    

    const supplyKey = PrivateKey.generateED25519();
    const freezeKey = PrivateKey.generateED25519();
    const wipeKey = PrivateKey.generateED25519();

    
    // local node - testing purposes only
    const operatorId = AccountId.fromString("0.0.2");
    const operatorKey = PrivateKey.fromString("302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137");

    // If we weren't able to get them, we should throw a new error
    if (operatorId == null ||
        operatorKey == null ) {
        throw new Error("Could not fetch 'operatorId' and 'operatorKey' properly");
    }

    const node = {"127.0.0.1:50211": new AccountId(3)};
    const client = Client.forNetwork(node)
        .setMirrorNetwork("127.0.0.1:5600")
        .setOperator(
            operatorId, 
            operatorKey
        );
    
    
    //const client = Client.forTestnet().setOperator(operatorId, operatorKey);
    
    
    /**     Example 1
     * 
     * Step 1
     * 
     * Create an NFT using the Hedera Token Service
     */
    
    // IPFS content identifiers for the NFT metadata
    const CID = [
        "QmNPCiNA3Dsu3K5FxDPMG5Q3fZRwVTg14EXA92uqEeSRXn",
        "QmZ4dgAgt8owvnULxnKxNe8YqpavtVCXmc1Lt2XajFpJs9",
        "QmPzY5GxevjyfMUF5vEAjtyRoigzWp47MiKAtLBduLMC1T",
        "Qmd3kGgSrAwwSrhesYcY7K54f3qD7MDo38r7Po2dChtQx5",
        "QmWgkKz3ozgqtnvbCLeh7EaR1H8u5Sshx3ZJzxkcrT3jbw",
    ];

    let nftCreateTx = await new TokenCreateTransaction()
    
        .setTokenName("HIP-542 Example Collection")
        .setTokenSymbol("HIP-542")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setMaxSupply(CID.length)
        .setTreasuryAccountId(operatorId)
        .setSupplyType(TokenSupplyType.Finite)
        .setAdminKey(operatorKey)
        .setFreezeKey(freezeKey)
        .setWipeKey(wipeKey)
        .setSupplyKey(supplyKey)
        .freezeWith(client);
    
    
    // Sign the transaction with the operator key
    let nftCreateTxSign = await nftCreateTx.sign(operatorKey);

    // Submit the transaction to the Hedera network
    let nftCreateSubmit = await nftCreateTxSign.execute(client);

    // Get transaction receipt information
    let nftCreateRx = await nftCreateSubmit.getReceipt(client);
    let nftTokenId = nftCreateRx.tokenId;
    console.log(`Created NFT with token id: ${nftTokenId.toString()} \n`);
    

    /**
     * Step 2
     * 
     * Mint the NFT
     */

    const nftCollection = [];
    for (var i = 0; i < CID.length; i++) {
        nftCollection[i] = await tokenMinterFcn(CID[i]);
        console.log(
            `Created NFT ${nftTokenId.toString()} with serial: ${nftCollection[
                i
            ].serials[0].toString()}`
            );
        }
    
    let exampleNftId = nftCollection[0].serials[0];

    /**
     * Step 3
     * 
     * Create an ECDSA public key alias
     */

    let newKey = PrivateKey.generateECDSA();
    let aliasAccountId = newKey.publicKey.toAccountId(0, 0);
    
    console.log(`newKey: ${newKey}`);
    console.log(`publicKey: ${newKey.publicKey}`);
    console.log(`aliasAccountId: ${aliasAccountId}`);

    // maybe not needed-------------------
    /* let accountCreateTx = await new AccountCreateTransaction()
        .setKey(newKey.publicKey)
		.setInitialBalance(new Hbar(0))
		.execute(client);

	const receipt = await accountCreateTx.getReceipt(client);
    const receiverId = receipt.accountId
    
    console.log(`publicKeyAlias: ${publicKeyAlias}`);
    console.log(`receiverId: ${receiverId}`); */
    // -----------------------------------

    /**
     * Step 4
     * 
     * Tranfer the NFT to the public key alias using the transfer transaction
     */

    let nftTransferTx = await new TransferTransaction()
        .addNftTransfer(
            nftTokenId,
            exampleNftId,
            operatorId,
            aliasAccountId
        )
        .freezeWith(client);

    // Sign the transaction with the operator key
    let nftTransferTxSign = await nftTransferTx.sign(operatorKey);

    // Submit the transaction to the Hedera network
    let nftTransferSubmit = await nftTransferTxSign.execute(client);

    // Get transaction receipt information here
    let nftTransferRx = await nftTransferSubmit.getReceipt(client);

    console.log(`NFT transfer receipt`);
    console.log(nftTransferRx);

    
    /**
     * Step 5
     * 
     * Return the new account ID in the child record
     */
    
    //Returns the info for the specified NFT id
    const nftInfo = await new TokenNftInfoQuery()
        .setNftId(new NftId(nftTokenId, exampleNftId))
        .execute(client);

    let nftOwnerAccountId = nftInfo[0].accountId.toString();
    console.log(`Current owner account id: ${nftOwnerAccountId}`);


    /**
     * Step 6
     * 
     * Show the new account ID owns the NFT
     */

    expect(nftOwnerAccountId).to.be.equal(aliasAccountId.toString());




    /**     Example 2
     * 
     * Step 1
     * 
     * Create a fungible HTS token using the Hedera Token Service
     */

    const tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName("HIP-542 Token")
        .setTokenSymbol("H542")
        .setTokenType(TokenType.FungibleCommon)
        .setTreasuryAccountId(operatorId)
        .setInitialSupply(10000) // Total supply = 10000 / 10 ^ 2
        .setDecimals(2)
        .setAutoRenewAccountId(operatorId)
        .freezeWith(client);

    
    // Sign the transaction with the operator key
    let tokenCreateTxSign = await tokenCreateTx.sign(operatorKey);

    // Submit the transaction to the Hedera network
    let tokenCreateSubmit = await tokenCreateTxSign.execute(client);

    // Get transaction receipt information
    let tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
    let tokenId = tokenCreateRx.tokenId;
    console.log(`Created token with token id: ${tokenId.toString()} \n`);


    /**
     * Step 2
     * 
     * Create an ECDSA public key alias
     * (we are going to use the same ECDSA key from the first example)
     */
    
    /**
     * Step 3
     * 
     * Transfer the fungible token to the public key alias
     */
    
    
    let tokenTransferTx = await new TransferTransaction()
        .addTokenTransfer(tokenId, operatorId, -10)
        .addTokenTransfer(tokenId, aliasAccountId, 10)
        .freezeWith(client)
    
    // Sign the transaction with the operator key
    let tokenTransferTxSign = await tokenTransferTx.sign(operatorKey);
    
    // Submit the transaction to the Hedera network
    let tokenTransferSubmit = await tokenTransferTxSign.execute(client);
    
    // Get transaction receipt information
    let tokenTransferRx = await tokenTransferSubmit.getReceipt(client);
    
    console.log(`Token transfer receipt`);
    console.log(tokenTransferRx);
    
    
    /**
     * Step 4
     * 
     * Return the new account ID in the child record
     */
    
     const accountBalances = await new AccountBalanceQuery()
        .setAccountId(aliasAccountId)
        .execute(client);

     
     /**
      * Step 5
      * 
      * Show the new account ID owns the fungible token
      */
     
     expect(accountBalances.tokens.get(tokenId).toInt()).to.be.equal(10);

    
    
    /**
     * TOKEN MINTER FUNCTION
     *
     * @param {string} CID
     * @returns {Promise<TransactionReceipt>}
     */
    async function tokenMinterFcn(CID) {
        const mintTx = new TokenMintTransaction()
            .setTokenId(nftTokenId)
            .setMetadata([Buffer.from(CID)])
            .freezeWith(client);
        let mintTxSign = await mintTx.sign(supplyKey);
        let mintTxSubmit = await mintTxSign.execute(client);
        return mintTxSubmit.getReceipt(client);
    }
}

void main();
