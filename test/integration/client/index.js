import {
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
} from "../../src/exports.js";
import Client from "../../src/client/NodeClient.js";
import dotenv from "dotenv";

// load .env (if available)
dotenv.config();

/**
 * @param {boolean} createNewAccount
 */
export default async function newIntegrationClient(createNewAccount = false) {
    let client;

    if (
        process.env.HEDERA_NETWORK != null &&
        process.env.HEDERA_NETWORK == "previewnet"
    ) {
        client = Client.forPreviewnet();
    } else {
        try {
            client = await Client.fromConfigFile(process.env.CONFIG_FILE);
        } catch (err) {
            client = Client.forTestnet();
        }
    }

    try {
        const operatorId =
            process.env.OPERATOR_ID || process.env.VITE_OPERATOR_ID;

        const operatorKey =
            process.env.OPERATOR_KEY || process.env.VITE_OPERATOR_KEY;

        client.setOperator(operatorId, operatorKey);
    } catch (err) {
        // ignore error and complain later
    }

    expect(client.operatorAccountId).to.not.be.null;
    expect(client.operatorPublicKey).to.not.be.null;

    if (createNewAccount) {
        var key = PrivateKey.generate();

        var accountId = (
            await (
                await new AccountCreateTransaction()
                    .setKey(key)
                    .setInitialBalance(new Hbar(100))
                    .execute(client)
            ).getReceipt(client)
        ).accountId;

        client.setOperator(accountId, key);
    }

    return client;
}
