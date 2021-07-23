// equivalent to [get-account-balance.js] but demonstrating native module syntax

import "dotenv/config";

import {
    Client,
    AccountBalanceQuery,
    PrivateKey,
    AccountId
} from "@hashgraph/sdk";

async function main() {
    let client;

    try {
        client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
            AccountId.fromString(process.env.OPERATOR_ID), 
            PrivateKey.fromString(process.env.OPERATOR_KEY)
            );            
    } catch {
        throw new Error("Environment variables HEDERA_NETWORK, OPERATOR_ID, and OPERATOR_KEY are required.");
    }

    const balance = await new AccountBalanceQuery()
        .setAccountId(client.operatorAccountId)
        .execute(client);

    console.log(`${client.operatorAccountId.toString()} balance = ${balance.hbars}`);
}

void main();
