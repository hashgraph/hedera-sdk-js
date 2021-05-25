import {
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
    AccountId,
} from "../../src/exports.js";
import Client from "../../src/client/NodeClient.js";
import dotenv from "dotenv";

// load .env (if available)
dotenv.config();

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
            process.env.HEDERA_NETWORK != null &&
            process.env.HEDERA_NETWORK == "previewnet"
        ) {
            client = Client.forPreviewnet();
        } else if (
            process.env.HEDERA_NETWORK != null &&
            process.env.HEDERA_NETWORK == "localhost"
        ) {
            client = Client.forNetwork({
                "127.0.0.1:50213": "0.0.3",
                "127.0.0.1:50214": "0.0.4",
                "127.0.0.1:50215": "0.0.5",
            });
        } else {
            try {
                client = await Client.fromConfigFile(process.env.CONFIG_FILE);
            } catch (err) {
                client = Client.forTestnet();
            }
        }

        try {
            const operatorId = AccountId.fromString(
                process.env.OPERATOR_ID || process.env.VITE_OPERATOR_ID
            );

            const operatorKey = PrivateKey.fromString(
                process.env.OPERATOR_KEY || process.env.VITE_OPERATOR_KEY
            );

            client.setOperator(operatorId, operatorKey);
        } catch (err) {
            // ignore error and complain later
        }

        expect(client.operatorAccountId).to.not.be.null;
        expect(client.operatorPublicKey).to.not.be.null;

        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key)
            .setInitialBalance(new Hbar(100))
            .execute(client);

        const accountId = (await response.getReceipt(client)).accountId;

        client.setOperator(accountId, key);

        return new IntegrationTestEnv(client, key, accountId, [
            response.nodeId,
        ]);
    }
}
