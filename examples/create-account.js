require('dotenv').config();

const { AccountId, Client, PrivateKey, AccountCreateTransaction, Hbar } = require("@hashgraph/sdk");

async function main() {
    const client = Client.forTestnet();
    const operatorId = AccountId.fromString("0.0.9523");
    const operatorKey = PrivateKey.fromString("302e020100300506032b65700422042091dad4f120ca225ce66deb1d6fb7ecad0e53b5e879aa45b0c5e0db7923f26d08");

    client.setOperator(operatorId, operatorKey);

    const newKey = PrivateKey.generate();

    console.log(`private key = ${newKey}`);
    console.log(`public key = ${newKey.getPublicKey()}`);

    const response = await new AccountCreateTransaction()
        .setInitialBalance(new Hbar(10)) // 10 h
        .setKey(newKey.publicKey)
        .execute(client);

    const receipt = await response.getReceipt(client);

    console.log(`account id = ${receipt.accountId}`);
}

void main();
