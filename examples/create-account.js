require("dotenv").config();

const {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
    AccountId,
} = require("@hashgraph/sdk");

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

    const newKey = PrivateKey.generate();

    console.log(`private key = ${newKey}`);
    console.log(`public key = ${newKey.publicKey}`);

    const response = await new AccountCreateTransaction()
        .setInitialBalance(new Hbar(10)) // 10 h
        .setKey(newKey.publicKey)
        .execute(client);

    const receipt = await response.getReceipt(client);

    console.log(`account id = ${receipt.accountId}`);
}

void main();
