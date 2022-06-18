import {
    AccountCreateTransaction,
    AccountId,
    AccountInfoQuery,
    Client,
    PrivateKey,
} from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();

async function main() {
    let client;

    try {
        client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
            AccountId.fromString(process.env.OPERATOR_ID),
            PrivateKey.fromString(process.env.OPERATOR_KEY)
        );
    } catch (error) {
        throw new Error(
            "Environment variables HEDERA_NETWORK, OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }

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
        .execute(client);

    // If we get here we have successfully created an account that
    // is staked to account ID 0.0.3
    const transactionReceipt = await resp.getReceipt(client);

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
        `fee payer aka operator key: ${client.operatorPublicKey.toString()}`
    );

    // Query the account info, it should show the staked account ID
    // to be 0.0.3 just like what we set it to
    const info = await new AccountInfoQuery()
        .setAccountId(newAccountId)
        .execute(client);

    console.log(`Staking info: ${info.stakingInfo.toString()}`);
}

void main();
