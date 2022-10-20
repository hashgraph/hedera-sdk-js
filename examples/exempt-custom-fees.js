import {
    AccountId,
    PrivateKey,
    TokenCreateTransaction,
    TokenType,
    TransferTransaction,
    CustomFractionalFee,
    Hbar,
    AccountCreateTransaction,
    LocalProvider,
    Wallet,
    AccountBalanceQuery,
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
    if (operatorId == null || operatorKey == null) {
        throw new Error(
            "Could not fetch 'operatorId' and 'operatorKey' properly"
        );
    }

    const wallet = new Wallet(operatorId, operatorKey, new LocalProvider());

    /**
     *     Example 1
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
    const firstAccountId = (await firstResponse.getReceiptWithSigner(wallet))
        .accountId;

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
    const secondAccountId = (await secondResponse.getReceiptWithSigner(wallet))
        .accountId;

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
    const thirdAccountId = (await thirdResponse.getReceiptWithSigner(wallet))
        .accountId;

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
        .setDenominator(100)
        .setAllCollectorsAreExempt(true);

    const fee2 = new CustomFractionalFee()
        .setFeeCollectorAccountId(secondAccountId)
        .setNumerator(2)
        .setDenominator(100)
        .setAllCollectorsAreExempt(true);

    const fee3 = new CustomFractionalFee()
        .setFeeCollectorAccountId(thirdAccountId)
        .setNumerator(3)
        .setDenominator(100)
        .setAllCollectorsAreExempt(true);

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
        .setMaxTransactionFee(new Hbar(40))
        .freezeWithSigner(wallet);

    // TokenCreateTransaction should be also signed with all of the fee collector wallets
    // in the custom fee list of the token before executing the transaction
    tokenCreateTx = await tokenCreateTx.signWithSigner(wallet);
    tokenCreateTx = await tokenCreateTx.signWithSigner(firstAccountWallet);
    tokenCreateTx = await tokenCreateTx.signWithSigner(secondAccountWallet);
    tokenCreateTx = await tokenCreateTx.signWithSigner(thirdAccountWallet);

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

    // First we transfer the amount from treasury account to second account
    let treasuryTokenTransferTx = await new TransferTransaction()
        .addTokenTransfer(tokenId, wallet.getAccountId(), -10000)
        .addTokenTransfer(tokenId, secondAccountWallet.getAccountId(), 10000)
        .freezeWithSigner(wallet);
    
    treasuryTokenTransferTx = await treasuryTokenTransferTx.signWithSigner(wallet);

    let treasuryTokenTransferSubmit = await treasuryTokenTransferTx.executeWithSigner(wallet);
    let status = (await treasuryTokenTransferSubmit.getReceiptWithSigner(wallet)).status.toString();
    console.log(`Sending from treasury account to the second account - 'TransferTransaction' status: ${status}`);


    let tokenTransferTx = await new TransferTransaction()
        .addTokenTransfer(tokenId, secondAccountId, -10000)
        .addTokenTransfer(tokenId, firstAccountId, 10000)
        .freezeWithSigner(wallet);

    // Sign the transaction also with the wallet of the sender
    tokenTransferTx = await tokenTransferTx.signWithSigner(wallet);
    tokenTransferTx = await tokenTransferTx.signWithSigner(secondAccountWallet);

    // Submit the transaction to the Hedera network
    let tokenTransferSubmit = await tokenTransferTx.executeWithSigner(wallet);

    /**
     * Step 4
     *
     * Get the transaction fee for that transfer transaction
     */

    // Get transaction record information
    let transactionFee = (await tokenTransferSubmit.getRecordWithSigner(wallet))
        .transactionFee;

    console.log(`Transaction fee: ${transactionFee.toString()}`);

    /**
     * Step 5
     *
     * Show that the fee collector accounts in the custom fee list
     * of the token that was created was not charged a custom fee in the transfer
     */

    let firstAccountBalanceAfter = (
        await new AccountBalanceQuery()
            .setAccountId(firstAccountId)
            .executeWithSigner(wallet)
    ).tokens._map
    .get(tokenId.toString())
    .toInt();

    let secondAccountBalanceAfter = (
        await new AccountBalanceQuery()
            .setAccountId(secondAccountId)
            .executeWithSigner(wallet)
    ).tokens._map
    .get(tokenId.toString())
    .toInt();

    let thirdAccountBalanceAfter = (
        await new AccountBalanceQuery()
            .setAccountId(thirdAccountId)
            .executeWithSigner(wallet)
    ).tokens._map
    .get(tokenId.toString())
    .toInt();


    console.log(`First account balance after TransferTransaction: ${firstAccountBalanceAfter}`);
    console.log(`Second account balance after TransferTransaction: ${secondAccountBalanceAfter}`);
    console.log(`Third account balance after TransferTransaction: ${thirdAccountBalanceAfter}`);

    if (
        firstAccountBalanceAfter === 10000 &&
        secondAccountBalanceAfter === 0 &&
        thirdAccountBalanceAfter === 0
    ) {
        console.log(
            `Fee collector accounts were not charged after transfer transaction`
        );
    }
}

void main();
