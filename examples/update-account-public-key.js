const { Client, Ed25519PrivateKey, AccountCreateTransaction, AccountUpdateTransaction, AccountInfoQuery } = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {
    const operatorPrivateKey = process.env.OPERATOR_KEY;
    const operatorAccount = process.env.OPERATOR_ID;

    if (operatorPrivateKey == null || operatorAccount == null) {
        throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
    }

    const client = new Client({
        network: { "0.testnet.hedera.com:50211": "0.0.3" },
        operator: {
            account: operatorAccount,
            privateKey: operatorPrivateKey
        }
    });

    // First, we create a new account so we don't affect our account

    const privateKey = await Ed25519PrivateKey.generate();
    const publicKey = await privateKey.publicKey;

    console.log(`private = ${privateKey.toString()}`);
    console.log(`public = ${privateKey.publicKey.toString()}`);

    const transactionId = await new AccountCreateTransaction()
        .setKey(publicKey)
        .setInitialBalance(0)
        .execute(client);

    // Get the account ID for the new account
    const transactionReceipt = await transactionId.getReceipt(client);
    const accountId = transactionReceipt.getAccountId();
    console.log(`account = ${accountId}`);

    // Create new keys
    const newPrivateKey = await Ed25519PrivateKey.generate();
    const newPublicKey = newPrivateKey.publicKey;

    console.log(`:: update keys of account ${accountId}`);
    console.log(`setKey = ${newPublicKey}`);

    // Update the key on the account
    const updateTransaction = await new AccountUpdateTransaction()
        .setAccountId(accountId)
        .setKey(newPublicKey) // The new public key to update the account with
        .build(client)
        .sign(privateKey) // Sign with the original private key on account
        .sign(newPrivateKey) // Sign with new private key on the account
        .execute(client);

    console.log(`transactionId = ${updateTransaction}`);

    // (important!) wait for the transaction to complete by querying the receipt
    await updateTransaction.getReceipt(client);

    console.log(":: get account info and check our current key");

    // Now we fetch the account information to check if the key was changed
    const acctInfo = await new AccountInfoQuery()
        .setAccountId(accountId)
        .execute(client);

    console.log(`key = ${acctInfo.key}`);
}
main();
