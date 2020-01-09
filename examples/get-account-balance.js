const { Client, AccountBalanceQuery } = require("@hashgraph/sdk");

async function main() {
    const operatorPrivateKey = process.env.OPERATOR_KEY;
    const operatorAccount = process.env.OPERATOR_ID;

    if (operatorPrivateKey == null || operatorAccount == null) {
        throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
    }

    const client = Client.forTestnet();

    client.setOperator(operatorAccount, operatorPrivateKey);

    const balance = await new AccountBalanceQuery()
        .setAccountId(operatorAccount)
        .execute(client);

    console.log(`${operatorAccount} balance = ${balance.asTinybar()}`);
}

main();
