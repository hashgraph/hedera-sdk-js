require("dotenv").config();

const {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    AccountDeleteTransaction,
    Hbar,
    AccountId,
} = require("@hashgraph/sdk");

async function main() {
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
        } catch (err) {
            client = Client.forTestnet();
        }
    }

    if (process.env.OPERATOR_KEY != null && process.env.OPERATOR_ID != null) {
        const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
        const operatorId = AccountId.fromString(process.env.OPERATOR_ID);

        client.setOperator(operatorId, operatorKey);
    }

    const newKey = PrivateKey.generate();

    console.log(`private key = ${newKey}`);
    console.log(`public key = ${newKey.publicKey}`);

    const response = await new AccountCreateTransaction()
        .setInitialBalance(new Hbar(10)) // 10 h
        .setKey(newKey.publicKey)
        .execute(client);

    const receipt = await response.getReceipt(client);

    console.log(`created account id = ${receipt.accountId}`);

    const transaction = new AccountDeleteTransaction()
        .setNodeAccountIds([response.nodeId])
        .setAccountId(receipt.accountId)
        .setTransferAccountId(client.operatorAccountId)
        .freezeWith(client);

    newKey.signTransaction(transaction);

    transaction.execute(client);

    console.log(`deleted account id = ${receipt.accountId}`);
}

void main();
