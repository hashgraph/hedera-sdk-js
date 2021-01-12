require("dotenv").config();

const { Client, AccountInfoQuery, Hbar, AccountId, PrivateKey } = require("@hashgraph/sdk");

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
            client = await Client.fromConfigFile(process.env.CONFIG_FILE);
        } catch (err) {
            client = Client.forTestnet();
        }
    }

    if (process.env.OPERATOR_KEY != null && process.env.OPERATOR_ID != null) {
        const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
        const operatorId = AccountId.fromString(process.env.OPERATOR_ID);

        client.setOperator(operatorId, operatorKey);
    }

    const info = await new AccountInfoQuery()
        .setAccountId(client.operatorAccountId)
        .setQueryPayment(new Hbar(1))
        .execute(client);

    console.log(`info.key                          = ${info.key}`);

    console.log(
        `info.isReceiverSignatureRequired  =`,
        info.isReceiverSignatureRequired
    );

    console.log(
        `info.expirationTime               = ${info.expirationTime.toDate()}`
    );
}

void main();
