import Client from "../../src/client/WebClient.js";
import {
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
} from "../../src/exports.js";

/**
 * @param {boolean} createNewAccount
 */
export async function newIntegrationClient(createNewAccount = false) {
    let client;

    if (
        import.meta.env.VITE_HEDERA_NETWORK != null &&
        import.meta.env.VITE_HEDERA_NETWORK == "previewnet"
    ) {
        client = Client.forPreviewnet();
    } else {
        client = Client.forTestnet();
    }

    try {
        const operatorId =
            import.meta.env.VITE_OPERATOR_ID ||
            import.meta.env.VITE_OPERATOR_ID;

        const operatorKey =
            import.meta.env.VITE_OPERATOR_KEY ||
            import.meta.env.VITE_OPERATOR_KEY;

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

// TODO: Remove this
export default newIntegrationClient;
