const { Client, Ed25519PrivateKey, AccountCreateTransaction, AccountDeleteTransaction, Hbar, TransactionId, AccountId } = require("@hashgraph/sdk");

async function main() {
    if (
        process.env.OPERATOR_KEY == null ||
        process.env.OPERATOR_ID == null
    ) {
        throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
    }

    let client;

    if (process.env.HEDERA_NETWORK != null) {
        switch (process.env.HEDERA_NETWORK) {
            case "previewnet":
                client = Client.forPreviewnet();
                break;
            default:
                client = Client.forTestnet();
        }
    } else {
        try {
            client = Client.fromConfigFile(process.env.CONFIG_FILE);
        } catch (error) {
            client = Client.forTestnet();
        }
    }

    let operatorPrivateKey;
    let operatorAccount;

    if (process.env.OPERATOR_KEY != null && process.env.OPERATOR_ID != null) {
        operatorPrivateKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY);
        operatorAccount = AccountId.fromString(process.env.OPERATOR_ID);

        client.setOperator(operatorAccount, operatorPrivateKey);
    }

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

