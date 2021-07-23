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

    if (process.env.HEDERA_NETWORK != null) {
        if (process.env.OPERATOR_KEY != null) {
            if (process.env.OPERATOR_ID != null) {
                client = Client.forName(process.env.HEDERA_NETWORK);   
                
                const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
                const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
        
                client.setOperator(operatorId, operatorKey);
            }
            else {
                throw new Error("Environment Variable:\tOPERATOR_ID is required to initialize the client.");
            }
        }
        else {
            throw new Error("Environment Variable:\tOPERATOR_KEY is required to initialize the client.");
        }
    }
    else {
        throw new Error("Environment Variable:\tHEDERA_NETWORK is required to initialize the client.\nThis value can be \"mainnet\", \"testnet\", or \"previewnet\".");
    }

    const balance = await new AccountBalanceQuery()
        .setAccountId(client.operatorAccountId)
        .execute(client);

    console.log(`${client.operatorAccountId.toString()} balance = ${balance.hbars}`);
}

void main();
