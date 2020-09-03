require('dotenv').config();

const { Client, PrivateKey, AccountCreateTransaction, Hbar } = require("@hashgraph/sdk");

async function main() {
    const client = Client.forTestnet();

    client.setOperator(process.env.OPERATOR_ID, process.env.OPERATOR_KEY);

    const newKey = PrivateKey.generate();

    console.log(`private key = ${newKey}`);
    console.log(`public key = ${newKey.publicKey}`);

    const response = await new AccountCreateTransaction()
        .setInitialBalance(new Hbar(10)) // 10 h
        .setKey(newKey.publicKey)
        .execute(client);

    // TODO: add back retries
    // wait 10s
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const receipt = await response.getReceipt(client);

    console.log(`account id = ${receipt.accountId}`);
}

void main();
