import {
    AccountId,
    PrivateKey,
    Client,
    TokenCreateTransaction,
    TokenType,
    TransferTransaction,
    CustomFractionalFee,
    Hbar,
    AccountCreateTransaction,
    LocalProvider,
    Wallet,
    TokenAssociateTransaction
} from "@hashgraph/sdk";


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
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
    

    // If we weren't able to get them, we should throw a new error
    if (operatorId == null || operatorKey == null ) {
        throw new Error("Could not fetch 'operatorId' and 'operatorKey' properly");
    }

    //const client = Client.forTestnet().setOperator(operatorId, operatorKey);
    /* const node = {"127.0.0.1:50211": new AccountId(3)};
    const client = Client.forNetwork(node)
        .setMirrorNetwork("127.0.0.1:5600")
        .setOperator(operatorId, operatorKey); */

    const wallet = new Wallet(
        operatorId,
        operatorKey,
        new LocalProvider()
    );
    
    /**     Example 1
     * 
     * Step 1
     * 
     * Create accounts A, B, and C
     */
    

    let firstAccountPrivateKey = PrivateKey.generateED25519();
    let firstAccountPublicKey = firstAccountPrivateKey.publicKey;

    let createAccountAtx = await new AccountCreateTransaction()
         .setKey(firstAccountPublicKey)
         .setInitialBalance(Hbar.fromString("1000"))
         .freezeWithSigner(wallet);
    createAccountAtx = await createAccountAtx.signWithSigner(wallet);
    
    let firstResponse = await createAccountAtx.executeWithSigner(wallet);
    const firstAccountId = (await firstResponse.getReceiptWithSigner(wallet)).accountId;
 
    const firstAccountWallet = new Wallet(
        firstAccountId,
        firstAccountPrivateKey,
        new LocalProvider()
    );

    let secondAccountPrivateKey = PrivateKey.generateED25519();
    let secondAccountPublicKey = secondAccountPrivateKey.publicKey;
 
    let createAccountBtx = await new AccountCreateTransaction()
        .setKey(secondAccountPublicKey)
        .setInitialBalance(Hbar.fromString("1000"))
        .freezeWithSigner(wallet);
    createAccountBtx = await createAccountBtx.signWithSigner(wallet);
     
    let secondResponse = await createAccountBtx.executeWithSigner(wallet);
    const secondAccountId = (await secondResponse.getReceiptWithSigner(wallet)).accountId;
  
    const secondAccountWallet = new Wallet(
        secondAccountId,
        secondAccountPrivateKey,
        new LocalProvider()
    );

    
    let thirdAccountPrivateKey = PrivateKey.generateED25519();
    let thirdAccountPublicKey = thirdAccountPrivateKey.publicKey;
 
    let createAccountCtx = await new AccountCreateTransaction()
        .setKey(thirdAccountPublicKey)
        .setInitialBalance(Hbar.fromString("1000"))
        .freezeWithSigner(wallet);
    createAccountCtx = await createAccountCtx.signWithSigner(wallet);
     
    let thirdResponse = await createAccountCtx.executeWithSigner(wallet);
    const thirdAccountId = (await thirdResponse.getReceiptWithSigner(wallet)).accountId;
  
    const thirdAccountWallet = new Wallet(
        thirdAccountId,
        thirdAccountPrivateKey,
        new LocalProvider()
    );


    /**
     * Step 2
     * 
     * 2. Create a fungible token that has three fractional fees
     * Fee #1 sends 1/100 of the transferred value to collector 0.0.A.
     * Fee #2 sends 2/100 of the transferred value to collector 0.0.B.
     * Fee #3 sends 3/100 of the transferred value to collector 0.0.C.
     */

     const fee = new CustomFractionalFee()
            .setFeeCollectorAccountId(firstAccountId)
            .setNumerator(1)
            .setDenominator(100);
     
    const fee2 = new CustomFractionalFee()
            .setFeeCollectorAccountId(secondAccountId)
            .setNumerator(2)
            .setDenominator(100);
    
    const fee3 = new CustomFractionalFee()
            .setFeeCollectorAccountId(thirdAccountId)
            .setNumerator(3)
            .setDenominator(100);


    let tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName("HIP-573 Token")
        .setTokenSymbol("H573")
        .setTokenType(TokenType.FungibleCommon)
        .setTreasuryAccountId(wallet.getAccountId())
        .setAutoRenewAccountId(wallet.getAccountId())
        .setAdminKey(wallet.getAccountKey())
        .setFreezeKey(wallet.getAccountKey())
        .setWipeKey(wallet.getAccountKey())
        .setInitialSupply(100000000) // Total supply = 100000000 / 10 ^ 2
        .setDecimals(2)
        .setCustomFees([fee, fee2, fee3])
        .freezeWithSigner(wallet);

    
    // Sign the transaction with the operator key
    tokenCreateTx = await tokenCreateTx.signWithSigner(wallet);

    // Submit the transaction to the Hedera network
    let tokenCreateSubmit = await tokenCreateTx.executeWithSigner(wallet);
    console.log(`response`);
    console.log(tokenCreateSubmit);
    console.log(tokenCreateTx);


    // Get transaction receipt information
    let tokenCreateRx = await tokenCreateSubmit.getReceiptWithSigner(wallet);
    let tokenId = tokenCreateRx.tokenId;
    console.log(`Created token with token id: ${tokenId.toString()} \n`);


    /**
     * Step 3
     * 
     * Collector 0.0.B sends 10_000 units of the token to 0.0.A.
     */
    
    const tokenAssociateTransaction =
        await new TokenAssociateTransaction()
        .setAccountId(firstAccountId)
        .setTokenIds([tokenId])
        .freezeWithSigner(firstAccountWallet);

    const signedTxForAssociateToken =
        await tokenAssociateTransaction.signWithSigner(firstAccountWallet);
    const txResponseAssociatedToken =
        await signedTxForAssociateToken.executeWithSigner(wallet);
    const status = (
        await txResponseAssociatedToken.getReceiptWithSigner(wallet)
    ).status;



    let tokenTransferTx = await new TransferTransaction()
        .addTokenTransfer(tokenId, secondAccountId, -10000)
        .addTokenTransfer(tokenId, firstAccountId, 10000)
        .freezeWithSigner(wallet)
        
        
    // Sign the transaction with the operator key
    let tokenTransferTxSign = await tokenTransferTx.signWithSigner(wallet);
        
    // Submit the transaction to the Hedera network
    let tokenTransferSubmit = await tokenTransferTxSign.executeWithSigner(wallet);
    
    
    /**
     * Step 4
     * 
     * Return the new account ID in the child record
     */

    // Get transaction receipt information
    let tokenTransferRx = await tokenTransferSubmit.getReceiptWithSigner(wallet);
        
    console.log(`Token transfer receipt`);
    console.log(tokenTransferRx);

     /**
      * Step 5
      * 
      * Show that the fee collector accounts in the custom fee list
      * of the token that was created was not charged a custom fee in the transfer
      */

     // TODO: Check 
     
}

void main();
