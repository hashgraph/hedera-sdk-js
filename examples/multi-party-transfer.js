const { Client, CryptoTransferTransaction, Hbar, AccountId, Ed25519PrivateKey } = require("@hashgraph/sdk");

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

    const transactionId = await new CryptoTransferTransaction()
        .addSender(operatorAccount, new Hbar(2)) // define total amount of hbar to send
        .addRecipient("0.0.3", new Hbar(1)) // add recipient, and amount of hbar
        .addRecipient("0.0.17210", new Hbar(1)) // add recipient, and amount of hbar
        .execute(client);

    const receipt = await transactionId.getRecord(client);
    console.log("receipt", `${JSON.stringify(receipt)}`);
}

main();

