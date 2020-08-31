const { Client, AccountBalanceQuery } = require("@hashgraph/sdk");

async function main() {
    const client = new Client();

    const balance = await new AccountBalanceQuery()
        .setAccountId("0.0.2")
        .execute(client);

    console.log("balance =", balance.toString());
}

void main();
