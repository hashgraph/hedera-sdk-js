const {
    Client,
    FileCreateTransaction,
    FileDeleteTransaction,
    Ed25519PrivateKey,
    AccountId,
    Hbar
} = require("@hashgraph/sdk");

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

    // First, we'll create a file with our operator as an admin
    const transactionId = await new FileCreateTransaction()
        .setContents("creating a file to test deletion")
        .setMaxTransactionFee(new Hbar(15))
        .addKey(operatorPrivateKey.publicKey)
        .execute(client);

    // The receipt will contain the FileId, or where it exists on the network
    const createFileReceipt = await transactionId.getReceipt(client);
    console.log("create file receipt", `${JSON.stringify(createFileReceipt)}`);

    // Then we'll delete this newly created file
    const deleteFileTransactionId = await new FileDeleteTransaction()
        .setFileId(createFileReceipt.getFileId()) // Define which file to delete
        .setMaxTransactionFee(new Hbar(1))
        .execute(client); // Presumes the client is the file's admin key

    // After deletion, the receipt should NOT contain a file ID
    const deleteFileReceipt = await deleteFileTransactionId.getReceipt(client);
    console.log("Status:", `${deleteFileReceipt.status}`);
}

main();
