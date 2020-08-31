const { Client, AccountBalanceQuery } = require("@hashgraph/sdk");

async function main() {
    const client = Client.forTestnet();

    const balance = await new AccountBalanceQuery()
        .setAccountId("0.0.3")
        .execute(client);

    console.log("0.0.3 balance =", balance.toString());
}

void main();
