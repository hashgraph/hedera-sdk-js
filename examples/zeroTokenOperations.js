// This example is for HIP-564 described here: https://hips.hedera.com/hip/hip-564

import * as hashgraph from "@hashgraph/sdk";
import ContractHelper from "./ContractHelper.js";
import contract from "./precompile-example/ZeroTokenOperations.json" assert { type: "json" };
import dotenv from "dotenv";

dotenv.config();

//Steps 1-5 are executed through ContractHelper and calling HIP564Example Contract.
//Step 6 is executed through the SDK

async function main() {
    // Keys should be ED25519
    // TODO: Fix the wallet to work with ECDSA
    if (process.env.OPERATOR_ID == null || process.env.OPERATOR_KEY == null) {
        throw new Error(
            "Environment variables OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }
    const myAccountId = hashgraph.AccountId.fromString(process.env.OPERATOR_ID);

    const wallet = new hashgraph.Wallet(
        process.env.OPERATOR_ID,
        process.env.OPERATOR_KEY,
        new hashgraph.LocalProvider()
    );

    const alicePrivateKey = hashgraph.PrivateKey.generateED25519();
    const alicePublicKey = alicePrivateKey.publicKey;

    let transaction = await new hashgraph.AccountCreateTransaction()
        .setKey(alicePublicKey)
        .setInitialBalance(hashgraph.Hbar.fromString("10"))
        .freezeWithSigner(wallet);
    transaction = await transaction.signWithSigner(wallet);

    let response = await transaction.executeWithSigner(wallet);
    const aliceAccountId = (await response.getReceiptWithSigner(wallet))
        .accountId;

    const aliceWallet = new hashgraph.Wallet(
        aliceAccountId,
        alicePrivateKey,
        new hashgraph.LocalProvider()
    );

    // Instantiate ContractHelper

    // The contract bytecode is located on the `object` field
    const contractBytecode = /** @type {string} */ (contract.bytecode);

    const contractHelper = await ContractHelper.init(
        contractBytecode,
        new hashgraph.ContractFunctionParameters()
            .addAddress(wallet.getAccountId().toSolidityAddress())
            .addAddress(aliceAccountId.toSolidityAddress()),
        wallet
    );

    // Configure steps in ContracHelper
    contractHelper
        .setPayableAmountForStep(0, new hashgraph.Hbar(20))
        .addSignerForStep(1, alicePrivateKey);
    // step 0 creates a fungible token
    // step 1 Associate with account
    // step 2 transfer the token by passing a zero value
    // step 3 mint the token by passing a zero value
    // step 4 burn the token by passing a zero value
    // step 5 wipe the token by passing a zero value

    await contractHelper.executeSteps(
        /* from step */ 0,
        /* to step */ 5,
        wallet
    );

    // step 6 use SDK and transfer passing a zero value
    //Create Fungible Token
    console.log(`Attempting to execute step 6`);

    let tokenCreateTransaction = await new hashgraph.TokenCreateTransaction()
        .setTokenName("Black Sea LimeChain Token")
        .setTokenSymbol("BSL")
        .setTreasuryAccountId(myAccountId)
        .setInitialSupply(10000) // Total supply = 10000 / 10 ^ 2
        .setDecimals(2)
        .setAutoRenewAccountId(myAccountId)
        .freezeWithSigner(wallet);

    tokenCreateTransaction = await tokenCreateTransaction.signWithSigner(
        wallet
    );
    let responseTokenCreate = await tokenCreateTransaction.executeWithSigner(
        wallet
    );
    const tokenId = (await responseTokenCreate.getReceiptWithSigner(wallet))
        .tokenId;

    //Associate Token with Account
    // Accounts on hedera have to opt in to receive any types of token that aren't HBAR
    const tokenAssociateTransaction =
        await new hashgraph.TokenAssociateTransaction()
            .setAccountId(aliceAccountId)
            .setTokenIds([tokenId])
            .freezeWithSigner(aliceWallet);

    const signedTxForAssociateToken =
        await tokenAssociateTransaction.signWithSigner(aliceWallet);
    const txResponseAssociatedToken =
        await signedTxForAssociateToken.executeWithSigner(wallet);
    const status = (
        await txResponseAssociatedToken.getReceiptWithSigner(wallet)
    ).status;

    //Transfer token
    const transferToken = await new hashgraph.TransferTransaction()
        .addTokenTransfer(tokenId, myAccountId, 0) // deduct 0 tokens
        .addTokenTransfer(tokenId, aliceAccountId, 0) // increase balance by 0
        .freezeWithSigner(wallet);

    const signedTransferTokenTX = await transferToken.signWithSigner(wallet);
    const txResponseTransferToken =
        await signedTransferTokenTX.executeWithSigner(wallet);

    //Verify the transaction reached consensus
    const transferReceipRecord =
        await txResponseTransferToken.getRecordWithSigner(wallet);

    console.log(
        `step 6 completed, and returned valid result. (TransactionId "${transferReceipRecord.transactionId.toString()}")`
    );

    console.log("All steps completed with valid results.");
}

void main();
