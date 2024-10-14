import {
    Client,
    PrivateKey,
    AccountId,
    Hbar,
    AccountCreateTransaction,
    TransferTransaction,
    AccountBalanceQuery,
    AccountDeleteTransaction,
    KeyList,
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

    // Create a client for the local Hedera network
    const client = Client.forNetwork({
        [process.env.HEDERA_NETWORK]: new AccountId(3)
    });
    client.setOperator(operatorId, operatorKey);

    try {
        console.log("Create Account With Threshold Key Example Start!");

        /*
         * Step 1:
         * Generate three new Ed25519 private, public key pairs.
         *
         * You do not need the private keys to create the Threshold Key List,
         * you only need the public keys, and if you're doing things correctly,
         * you probably shouldn't have these private keys.
         */

        // Generate 3 new Ed25519 private, public key pairs
        const privateKeys = [];
        const publicKeys = [];
        for (let i = 0; i < 3; i++) {
            const key = PrivateKey.generateED25519();
            privateKeys.push(key);
            publicKeys.push(key.publicKey);
        }

        console.log("Generating public keys...");
        publicKeys.forEach((publicKey, index) => {
            console.log(`Generated public key ${index + 1}: ${publicKey.toString()}`);
        });

        /*
         * Step 2:
         * Create a Key List.
         *
         * Require 2 of the 3 keys we generated to sign on anything modifying this account.
         */
        const thresholdKey = new KeyList();
        thresholdKey.setThreshold(2);
        publicKeys.forEach((publicKey) => thresholdKey.push(publicKey));

        /*
         * Step 3:
         * Create a new account setting a Key List from a previous step as an account's key.
         */
        console.log("Creating new account...");
        const accountCreateTxResponse = await new AccountCreateTransaction()
            .setKey(thresholdKey)
            .setInitialBalance(new Hbar(1))
            .execute(client);

        const accountCreateTxReceipt = await accountCreateTxResponse.getReceipt(client);
        const newAccountId = accountCreateTxReceipt.accountId;
        if (!newAccountId) {
            throw new Error("Failed to retrieve new account ID");
        }
        console.log(`Created account with ID: ${newAccountId.toString()}`);

        /*
         * Step 4:
         * Create a transfer transaction from a newly created account to demonstrate the signing process (threshold).
         */
        console.log("Transferring 1 Hbar from a newly created account...");
        let transferTx =  new TransferTransaction()
            .addHbarTransfer(newAccountId, new Hbar(-1)) // 1 Hbar in negative
            .addHbarTransfer(new AccountId(3), new Hbar(1)) // 1 Hbar
            .freezeWith(client); // Freeze with client

        // Sign with 2 of the 3 keys
        transferTx = await transferTx.sign(privateKeys[0]);
        transferTx = await transferTx.sign(privateKeys[1]);

        // Execute the transaction
        const transferTxResponse = await transferTx.execute(client);

        // Wait for the transfer to reach consensus
        await transferTxResponse.getReceipt(client);

        // Query the account balance after the transfer
        const accountBalanceAfterTransfer = await new AccountBalanceQuery()
            .setAccountId(newAccountId)
            .execute(client);

        console.log("New account's Hbar balance after transfer: " + accountBalanceAfterTransfer.hbars.toString());

        /*
         * Step 5:
         * Clean up: Delete created account.
         */
        let accountDeleteTx =  new AccountDeleteTransaction()
            .setTransferAccountId(operatorId)
            .setAccountId(newAccountId)
            .freezeWith(client);

        accountDeleteTx = await accountDeleteTx.sign(privateKeys[0]);
        accountDeleteTx = await accountDeleteTx.sign(privateKeys[1]);

        const accountDeleteTxResponse = await accountDeleteTx.execute(client);
        await accountDeleteTxResponse.getReceipt(client);

        console.log("Account deleted successfully");

        console.log("Create Account With Threshold Key Example Complete!");
    } catch (error) {
        console.error("Error occurred:", error);
    } finally {
        // Close the client
        client.close();
    }
}

main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
});