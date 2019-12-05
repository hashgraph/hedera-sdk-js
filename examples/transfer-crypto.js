const { Client, CryptoTransferTransaction } = require("@hashgraph/sdk");

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

    const tx = new CryptoTransferTransaction()
        .addSender(operatorAccount, 10)
        .addRecipient("0.0.3", 10)
        .setMemo("[sdk example] transfer to 0.0.3")
        .build(client);

    await tx.execute(client);
}

main();
