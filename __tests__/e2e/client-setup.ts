import { Client, Hbar, AccountId, Ed25519PrivateKey, AccountCreateTransaction } from "../../src/index-node";
import * as fs from "fs";
import * as util from "util";
import { assert } from "console";

export async function getClientForIntegrationTest(token: boolean): Promise<Client> {
    let client: Client;

    if (process.env.HEDERA_NETWORK != null && process.env.HEDERA_NETWORK == "previewnet") {
        client = Client.forPreviewnet();
    } else {
        const configPath = process.env.CONFIG_FILE;

        try {
            const file = await util.promisify(fs.readFile)(configPath != null ? configPath : "");
            client = Client.fromJson(file.toString());
        } catch {
            client = Client.forTestnet();
        }
    }

    if (process.env.OPERATOR_ID != null && process.env.OPERATOR_KEY != null) {
        try {
            const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
            const operatorKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY);
            client.setOperator(operatorId, operatorKey);
        } catch (error) {
            console.error(error);
        }
    }

    if (token) {
        const newKey = await Ed25519PrivateKey.generate();

        const transactionId = await new AccountCreateTransaction()
            .setKey(newKey.publicKey)
            .setInitialBalance(new Hbar(20))
            .execute(client);

        const receipt = await transactionId.getReceipt(client);

        client.setOperator(receipt.getAccountId(), newKey);
    }

    assert(client._getOperatorAccountId() != null, "operator account id was not provided in config file or environment");
    assert(client._getOperatorKey() != null, "operator key was not provided in config file or environment");

    return client;
}
