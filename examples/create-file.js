const { Client, FileCreateTransaction, Ed25519PrivateKey, Hbar } = require("@hashgraph/sdk");

async function main() {
    const operatorAccount = process.env.OPERATOR_ID;
    const operatorPrivateKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY);
    const operatorPublicKey = operatorPrivateKey.publicKey;

    if (operatorPrivateKey == null || operatorAccount == null) {
        throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(operatorAccount, operatorPrivateKey);

    const transactionId = await new FileCreateTransaction()
        .setContents("Hello, Hedera's file service!")
        .addKey(operatorPublicKey) // Defines the "admin" of this file
        .setMaxTransactionFee(new Hbar(15))
        .execute(client);

    const receipt = await transactionId.getReceipt(client);
    console.log("new file id =", receipt.getFileId());
}

main();
