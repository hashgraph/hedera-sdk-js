const { Client, AccountCreateTransaction, Hbar } = require("@hashgraph/sdk");
const { PrivateKey } = require("@hashgraph/cryptography");

async function main() {
    const client = Client.forTestnet();

    client.setOperator("<operator_id>", "<operator_key>");

    const newKey = PrivateKey.generate();

    const response = await new AccountCreateTransaction()
        .setInitialBalance(new Hbar(10)) // 10 h
        .setKey(newKey.publicKey)
        .execute(client);

    console.log(response);
}

void main();
