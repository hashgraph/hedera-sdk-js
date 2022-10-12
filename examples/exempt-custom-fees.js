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
    CustomFractionalFee,
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
Example for HIP-573: Blanket exemptions for custom fee collectors

1. Create accounts A, B, and C
2. Create a fungible token that has three fractional fees
Fee #1 sends 1/100 of the transferred value to collector 0.0.A.
Fee #2 sends 2/100 of the transferred value to collector 0.0.B.
Fee #3 sends 3/100 of the transferred value to collector 0.0.C.
3. Collector 0.0.B sends 10_000 units of the token to 0.0.A.
4. Get the transaction fee for that transfer transaction
5. Show that the fee collector accounts in the custom fee list of the token
that was created was not charged a custom fee in the transfer

*/

async function main() {
    
    // Configure accounts and client, and generate needed keys
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PRIVATE_KEY);
    /* const treasuryId = AccountId.fromString(process.env.TREASURY_ID);
    const treasuryKey = PrivateKey.fromString(process.env.TREASURY_PRIVATE_KEY);
    const aliceId = AccountId.fromString(process.env.ALICE_ID);
    const aliceKey = PrivateKey.fromString(process.env.ALICE_PRIVATE_KEY);
    const bobId = AccountId.fromString(process.env.BOB_ID);
    const bobKey = PrivateKey.fromString(process.env.BOB_PRIVATE_KEY); */
    
    const supplyKey = PrivateKey.generateED25519();
    const freezeKey = PrivateKey.generateED25519();
    const wipeKey = PrivateKey.generateED25519();


    // If we weren't able to get them, we should throw a new error
    if (operatorId == null ||
        operatorKey == null ) {
        throw new Error("Could not fetch 'operatorId' and 'operatorKey' properly");
    }
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);
    
    
    /**     Example 1
     * 
     * Step 1
     * 
     * Create accounts A, B, and C
     */
    

    let accountAkey = PrivateKey.generateED25519();
    let aliasAccountAid = accountAkey.publicKey.toAccountId(0, 0);
    
    console.log(`accountAkey: ${accountAkey}`);
    console.log(`publicKey: ${accountAkey.publicKey}`);
    console.log(`aliasAccountAid: ${aliasAccountAid}`);

    let accountBkey = PrivateKey.generateED25519();
    let aliasAccountBid = accountBkey.publicKey.toAccountId(0, 0);
    
    console.log(`accountBkey: ${accountBkey}`);
    console.log(`publicKey: ${accountBkey.publicKey}`);
    console.log(`aliasAccountBid: ${aliasAccountBid}`);

    let accountCkey = PrivateKey.generateED25519();
    let aliasAccountCid = accountCkey.publicKey.toAccountId(0, 0);
    
    console.log(`accountCkey: ${accountCkey}`);
    console.log(`publicKey: ${accountCkey.publicKey}`);
    console.log(`aliasAccountCid: ${aliasAccountCid}`);

    const clientB = Client.forTestnet()
        .setOperator(aliasAccountBid, accountBkey);


    /**
     * Step 2
     * 
     * 2. Create a fungible token that has three fractional fees
     * Fee #1 sends 1/100 of the transferred value to collector 0.0.A.
     * Fee #2 sends 2/100 of the transferred value to collector 0.0.B.
     * Fee #3 sends 3/100 of the transferred value to collector 0.0.C.
     */

     const fee = new CustomFractionalFee()
            .setFeeCollectorAccountId(aliasAccountAid)
            .setNumerator(1)
            .setDenominator(1)
     
    const fee2 = new CustomFractionalFee()
            .setFeeCollectorAccountId(aliasAccountBid)
            .setNumerator(1)
            .setDenominator(2)
    
    const fee3 = new CustomFractionalFee()
            .setFeeCollectorAccountId(aliasAccountCid)
            .setNumerator(1)
            .setDenominator(3)


    const tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName("HIP-542 Token")
        .setTokenSymbol("H542")
        .setTokenType(TokenType.FungibleCommon)
        .setTreasuryAccountId(operatorId)
        .setInitialSupply(100000000) // Total supply = 100000000 / 10 ^ 2
        .setDecimals(2)
        .setCustomFees([fee, fee2, fee3])
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
     * Step 3
     * 
     * Collector 0.0.B sends 10_000 units of the token to 0.0.A.
     */
    
    let tokenTransferTx = await new TransferTransaction()
        .addTokenTransfer(tokenId, aliasAccountBid, -10000)
        .addTokenTransfer(tokenId, aliasAccountAid, 10000)
        .freezeWith(client)
        
        
    // Sign the transaction with the operator key
    let tokenTransferTxSign = await tokenTransferTx.sign(operatorKey);
        
    // Submit the transaction to the Hedera network
    let tokenTransferSubmit = await tokenTransferTxSign.execute(client);
    
    
    /**
     * Step 4
     * 
     * Return the new account ID in the child record
     */

    // Get transaction receipt information
    let tokenTransferRx = await tokenTransferSubmit.getReceipt(client);
        
    console.log(`Token transfer receipt\n${tokenTransferRx}`);

     /**
      * Step 5
      * 
      * Show that the fee collector accounts in the custom fee list
      * of the token that was created was not charged a custom fee in the transfer
      */

     // TODO: Check 
     
}

void main();
