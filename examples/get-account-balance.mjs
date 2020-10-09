// equivalent of [get-account-balance.js] but demonstrating es native module syntax
import { Client, AccountBalanceQuery } from "@hashgraph/sdk";

async function main() {
    const client = Client.forTestnet();

    const balance = await new AccountBalanceQuery()
        .setAccountId("0.0.3")
        .execute(client);

    console.log(`0.0.3 balance = ${balance}`);
}

void main();
