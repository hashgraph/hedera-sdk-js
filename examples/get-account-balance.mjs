// equivalent of [get-account-balance.js] but demonstrating es native module syntax
import { Client, AccountBalanceQuery } from "@hashgraph/sdk";

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

    const balance = await new AccountBalanceQuery()
        .setAccountId("0.0.3")
        .execute(client);

    console.log(`0.0.3 balance = ${balance}`);
}

void main();
