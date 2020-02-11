const { Client, Ed25519PrivateKey, AccountCreateTransaction, AccountDeleteTransaction, Hbar, TransactionId } = require("@hashgraph/sdk");

async function main() {
    const operatorPrivateKey = process.env.OPERATOR_KEY;
    const operatorAccount = process.env.OPERATOR_ID;

    if (operatorPrivateKey == null || operatorAccount == null) {
        throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(operatorAccount, operatorPrivateKey);

    const privateKey = await Ed25519PrivateKey.generate();

    console.log("Creating an account to delete");
    console.log(`private = ${privateKey.toString()}`);
    console.log(`public = ${privateKey.publicKey.toString()}`);

    let transactionId = await new AccountCreateTransaction()
        .setKey(privateKey.publicKey)
        .setInitialBalance(new Hbar(2))
        .execute(client);

    let transactionReceipt = await transactionId.getReceipt(client);
    const newAccountId = transactionReceipt.getAccountId();

    console.log(`account = ${newAccountId}`);
    console.log("Deleting created account");

    // To delete an account you **MUST** do the following:
    transactionId = await new AccountDeleteTransaction()
        // Set which account to delete.
        .setDeleteAccountId(newAccountId)
        // Set which account to transfer the remaining balance to.
        .setTransferAccountId("0.0.3")
        // Manually set a `TransactionId` constructed from the `AccountId` you are  deleting.
        .setTransactionId(new TransactionId(newAccountId))
        .build(client)
        // Sign the transaction with the same key as on the acount being deleted.
        .sign(privateKey)
        // Finally, execute the transaction with `Transaction.execute()`
        .execute(client);

    transactionReceipt = await transactionId.getReceipt(client);

    console.log(`status: ${transactionReceipt.status}`);
}

main();

