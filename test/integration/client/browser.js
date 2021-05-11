import Client from "../../src/client/WebClient.js";
import {
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
} from "../../src/exports.js";

export default class IntegrationTestEnv {
    /**
     * @type {Client} client
     * @type {PrivateKey} operatorKey
     * @type {AccountId} operatorId
     * @type {AccountId[]} nodeAccountIds
     */
    constructor(client, operatorKey, operatorId, nodeAccountIds) {
        /** @type {Client} */
        this.client = client;

        /** @type {PrivateKey} */
        this.operatorKey = operatorKey;

        /** @type {AccountId} */
        this.operatorId = operatorId;

        /** @type {[]} */
        this.nodeAccountIds = nodeAccountIds;

        Object.freeze(this);
    }

    static async new() {
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

        var key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key)
            .setInitialBalance(new Hbar(100))
            .execute(client);

        var accountId = (await response.getReceipt(client)).accountId;

        client.setOperator(accountId, key);

        return new IntegrationTestEnv(client, key, accountId, [
            response.nodeId,
        ]);
    }
}
