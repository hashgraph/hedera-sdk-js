import {
    AccountCreateTransaction,
    AccountUpdateTransaction,
    AccountId,
    AccountInfoQuery,
    Wallet,
    LocalProvider,
    PrivateKey,
} from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();

async function main() {
    if (process.env.OPERATOR_ID == null || process.env.OPERATOR_KEY == null) {
        throw new Error(
            "Environment variables OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }

    const wallet = new Wallet(
        process.env.OPERATOR_ID,
        process.env.OPERATOR_KEY,
        new LocalProvider()
    );

    const newKey = PrivateKey.generate();

    console.log(`private key = ${newKey.toString()}`);
    console.log(`public key = ${newKey.publicKey.toString()}`);

    // Create an account and stake to an acount ID
    // In this case we're staking to account ID 3 which happens to be
    // the account ID of node 0, we're only doing this as an example.
    // If you really want to stake to node 0, you should use
    // `.setStakedNodeId()` instead
    const resp = await new AccountCreateTransaction()
        .setKey(newKey.publicKey)
        .setInitialBalance(20)
        .setStakedAccountId("0.0.3")
        .executeWithSigner(wallet);

    // If we get here we have successfully created an account that
    // is staked to account ID 0.0.3
    const transactionReceipt = await resp.getReceiptWithSigner(wallet);

    // The new account ID
    const newAccountId = transactionReceipt.accountId;

    console.log(`account id = ${newAccountId.toString()}`);

    // Show the required key used to sign the account update transaction to
    // stake the accounts hbar i.e. the fee payer key and key to authorize
    // changes to the account should be different
    console.log(
        `key required to update staking information: ${newKey.publicKey.toString()}`
    );
    console.log(
        `fee payer aka operator key: ${wallet.getAccountKey().toString()}`
    );

    // Query the account info, it should show the staked account ID
    // to be 0.0.3 just like what we set it to
    let info = await new AccountInfoQuery()
        .setAccountId(newAccountId)
        .executeWithSigner(wallet);

    console.log(`Staking info: ${info.stakingInfo.toString()}`);

    // Use the `AccountUpdateTransaction` to unstake the account's hbars
    //
    // If this succeeds then we should no longer have a staked account ID
    await (
        await (
            await (await new AccountUpdateTransaction()
                .setAccountId(newAccountId)
                .clearStakedAccountId()
                .freezeWithSigner(wallet))
                // Sign the transaction with the account key
                .sign(newKey)
        ).executeWithSigner(wallet)
    ).getReceiptWithSigner(wallet);

    // Query the account info, it should show the staked account ID
    // to be 0.0.3 just like what we set it to
    info = await new AccountInfoQuery()
        .setAccountId(newAccountId)
        .executeWithSigner(wallet);

    console.log(`Staking info: ${info.stakingInfo.toString()}`);
}

void main();
