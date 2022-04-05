import {
    PrivateKey,
    AccountCreateTransaction,
    TokenDeleteTransaction,
    Hbar,
    AccountId,
} from "../../../src/exports.js";

/**
 * @typedef {import("../../../src/exports.js").TokenId} TokenId
 * @typedef {import("../../../src/client/Client.js").Client<*, *>} Client
 */

export default class BaseIntegrationTestEnv {
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
     * @property {Client<*, *>} options.client
     * @property {{ [key: string]: string}} options.env
     * @property {number} [options.nodeAccountIds]
     * @property {number} [options.balance]
     * @property {boolean} [options.throwaway]
     */
    static async new(options = {}) {
        let client;

        if (
            options.env.HEDERA_NETWORK != null &&
            options.env.HEDERA_NETWORK == "previewnet"
        ) {
            client = options.client.forPreviewnet();
        } else if (
            options.env.HEDERA_NETWORK != null &&
            options.env.HEDERA_NETWORK == "testnet"
        ) {
            client = options.client.forTestnet();
        } else if (
            options.env.HEDERA_NETWORK != null &&
            options.env.HEDERA_NETWORK == "localhost"
        ) {
            client = options.client.forNetwork({
                "127.0.0.1:50213": "0.0.3",
                "127.0.0.1:50214": "0.0.4",
                "127.0.0.1:50215": "0.0.5",
            });
        } else if (options.env.CONFIG_FILE != null) {
            client = await options.client.fromConfigFile(options.env.CONFIG_FILE);
        } else {
            throw new Error("Failed to construct client for IntegrationTestEnv");
        }

        if (options.env.OPERATOR_ID != null && options.env.OPERATOR_KEY != null) {
            const operatorId = AccountId.fromString(options.env.OPERATOR_ID);
            const operatorKey = PrivateKey.fromString(options.env.OPERATOR_KEY);

            client.setOperator(operatorId, operatorKey);
        }

        expect(client.operatorAccountId).to.not.be.null;
        expect(client.operatorPublicKey).to.not.be.null;

        const originalOperatorKey = client.operatorAccountKey;
        const originalOperatorId = client.operatorAccountId;

        client.setMaxNodeAttempts(1)
            .setNodeMinBackoff(0)
            .setNodeMaxBackoff(0)
            .setNodeMinReadmitPeriod(0)
            .setNodeMaxReadmitPeriod(0);

        await client.pingAll();

        const network = {};
        const nodeAccountIds = options.nodeAccountIds != null ? options.nodeAccountIds : 1;
        for (const [ key, value ] of Object.entries(client.network)) {
            network[key] = value;

            if (Object.keys(network).length >= nodeAccountIds) {
                break;
            }
        }
        client.setNetwork(network);

        const newOperatorKey = PrivateKey.generateED25519();

        const response = await new AccountCreateTransaction()
            .setKey(newOperatorKey)
            .setInitialBalance(new Hbar(options.balance != null ? options.balance : 100))
            .execute(client);

        const newOperatorId = (await response.getReceipt(client)).accountId;

        client.setOperator(newOperatorId, newOperatorKey);

        return new BaseIntegrationTestEnv({
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
     * @property {TokenId | TokenId[]} token
     */
    async close(options = {}) {
        if (options.token != null) {
            if (!Array.isArray(options.token)) {
                options.token = [options.token];
            }

            for (const token of options.token) {
                await (await new TokenDeleteTransaction()
                    .setTokenId(token)
                    .execute(this.client)
                ).getReceipt(this.client);
            }
        }

        // if (!this.throwaway && this.operatorId.toString() !== this.originalOperatorId.toString()) {
        //     await (await new AccountDeleteTransaction()
        //         .setAccountId(this.operatorId)
        //         .setTransferAccountId(this.originalOperatorId)
        //         .execute(this.client)
        //     ).getReceipt(this.client);
        // }

        this.client.close();
    }
}
