const { Client, CryptoTransferTransaction } = require("@hashgraph/sdk");

async function main() {
    const operatorPrivateKey = process.env.OPERATOR_KEY;
    const operatorAccount = process.env.OPERATOR_ID;

    if (operatorPrivateKey == null || operatorAccount == null) {
        throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(operatorAccount, operatorPrivateKey);

    const receipt = await (await new CryptoTransferTransaction()
        .addSender(operatorAccount, 1)
        .addRecipient("0.0.3", 1)
        .setTransactionMemo("sdk example")
        .execute(client))
        .getReceipt(client);

    console.log(receipt);
}

main();
