import {
    PrivateKey,
    AccountCreateTransaction,
    AccountDeleteTransaction,
    TokenDeleteTransaction,
    Hbar,
    AccountId,
} from "../../src/exports.js";
import Client from "../../src/client/NodeClient.js";

/**
 * @typedef {import("../../exports.js").TokenId} TokenId
 */
// import dotenv from "dotenv";

export { Client };

export default class IntegrationTestEnv {
    /**
     * @param {object} options
     * @property {Client} props.client
     * @property {PublicKey} options.originalOperatorKey
     * @property {AccountId} options.originalOperatorId
     * @property {PrivateKey} options.originalOperatorKey
     * @property {AccountId} options.newOperatorKey
     * @property {AccountId[]} options.newOperatorId
     */
    constructor(options) {
        /** @type {Client} */
        this.client = options.client;

        /** @type {PrivateKey} */
        this.operatorKey = options.newOperatorKey;

        /** @type {AccountId} */
        this.operatorId = options.newOperatorId;

        /** @type {PrivateKey} */
        this.originalOperatorKey = options.originalOperatorKey;

        /** @type {AccountId} */
        this.originalOperatorId = options.originalOperatorId;

        this.throwaway = options.throwaway;

        Object.freeze(this);
    }

    /**
     * @param {object} [options]
     * @property {number} [options.nodeAccountIds]
     * @property {number} [options.balance]
     * @property {boolean} [options.throwaway]
     */
    static async new(options = {}) {
        // load .env (if available)
        // dotenv.config();

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
            client = await Client.fromConfigFile(process.env.CONFIG_FILE);
        }

        if (
            (process.env.OPERATOR_ID != null || process.env.VITE_OPERATOR_ID != null) &&
            (process.env.OPERATOR_KEY != null || process.env.VITE_OPERATOR_KEY != null)
        ) {
            const operatorId = AccountId.fromString(process.env.OPERATOR_ID || process.env.VITE_OPERATOR_ID);

            const operatorKey = PrivateKey.fromString(
                process.env.OPERATOR_KEY || process.env.VITE_OPERATOR_KEY
            );

            client.setOperator(operatorId, operatorKey);
        }

        expect(client.operatorAccountId).to.not.be.null;
        expect(client.operatorPublicKey).to.not.be.null;

        const originalOperatorKey = client.operatorAccountKey;
        const originalOperatorId = client.operatorAccountId;

        await client
            .setNodeWaitTime(8000)
            .setMaxNodeAttempts(1)
            .pingAll();

        const network = {};
        const nodeAccountIds = options.nodeAccountIds != null ? options.nodeAccountIds : 1;
        for (const [ key, value ] of Object.entries(client.network)) {
            network[key] = value;

            if (Object.keys(network).length >= nodeAccountIds) {
                break;
            }
        }
        client.setNetwork(network);

        const newOperatorKey = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(newOperatorKey)
            .setInitialBalance(new Hbar(options.balance != null ? options.balance : 100))
            .execute(client);

        const newOperatorId = (await response.getReceipt(client)).accountId;

        client.setOperator(newOperatorId, newOperatorKey);

        return new IntegrationTestEnv({
            client: client,
            originalOperatorKey: originalOperatorKey,
            originalOperatorId: originalOperatorId,
            newOperatorKey: newOperatorKey,
            newOperatorId: newOperatorId,
            throwaway: options.throwaway,
        });
    }

    /**
     * @param {object} [options]
     * @property {TokenId} token
     */
    async close(options = {}) {
        if (options.token != null) {
            await (await new TokenDeleteTransaction()
                .setTokenId(options.token)
                .execute(this.client)
            ).getReceipt(this.client);
        }

        if (!this.throwaway && this.operatorKey.toString() !== this.originalOperatorId) {
            await (await new AccountDeleteTransaction()
                .setAccountId(this.operatorId)
                .setTransferAccountId(this.originalOperatorId)
                .execute(this.client)
            ).getReceipt(this.client);
        }

        this.client.close();
    }
}
