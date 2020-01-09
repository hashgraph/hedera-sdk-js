const { Client, Ed25519PrivateKey, AccountCreateTransaction, AccountDeleteTransaction, Hbar, TransactionId } = require("@hashgraph/sdk");

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

    const privateKey = await Ed25519PrivateKey.generate();

    console.log("Creating an account to delete");
    console.log(`private = ${privateKey.toString()}`);
    console.log(`public = ${privateKey.publicKey.toString()}`);

    let transactionId = await new AccountCreateTransaction()
        .setKey(privateKey.publicKey)
        .setInitialBalance(Hbar.of(2))
        .execute(client);

    let transactionReceipt = await transactionId.getReceipt(client);
    const newAccountId = transactionReceipt.getAccountId();

    console.log(`account = ${newAccountId}`);
    console.log("Deleting created account");

    transactionId = await new AccountDeleteTransaction()
        .setDeleteAccountId(newAccountId)
        .setTransferAccountId("0.0.3")
        .setTransactionId(new TransactionId(newAccountId))
        .build(client)
        .sign(privateKey)
        .execute(client);

    transactionReceipt = await transactionId.getReceipt(client);

    console.log(`status: ${transactionReceipt.status}`);
}

main();

