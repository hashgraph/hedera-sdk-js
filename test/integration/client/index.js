import {
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
    AccountId
} from "../../src/exports.js";
import Client from "../../src/client/NodeClient.js";
import dotenv from "dotenv";

// load .env (if available)
dotenv.config();

export default class IntegrationTestEnv {

    constructor() {
        /** @type {Client} */
        this.client = new Client();

        /** @type {PrivateKey} */
        this.operatorKey = new PrivateKey(undefined, undefined);

        /** @type {AccountId} */
        this.operatorId = new AccountId(0);

        /** @type {[]} */
        this.nodeAccountIds = [];
    }

    static async new() {
        if (
            process.env.HEDERA_NETWORK != null &&
            process.env.HEDERA_NETWORK == "previewnet"
        ) {
            this.client = Client.forPreviewnet();
        } else {
            try {
                this.client = await Client.fromConfigFile(process.env.CONFIG_FILE);
            } catch (err) {
                this.client = Client.forTestnet();
            }
        }

        try {
            const operatorId =
                process.env.OPERATOR_ID || process.env.VITE_OPERATOR_ID;

            this.operatorId = AccountId.fromString(operatorId);

            const operatorKey =
                process.env.OPERATOR_KEY || process.env.VITE_OPERATOR_KEY;

            this.operatorKey = PrivateKey.fromString(operatorKey);

            this.client.setOperator(this.operatorId, this.operatorKey);
        } catch (err) {
            // ignore error and complain later
        }

        expect(this.client.operatorAccountId).to.not.be.null;
        expect(this.client.operatorPublicKey).to.not.be.null;

        const key = PrivateKey.generate();

        const resp = await new AccountCreateTransaction()
            .setKey(key)
            .setInitialBalance(new Hbar(50))
            .execute(this.client)

        const receipt = await resp.getReceipt(this.client)

        this.operatorId = receipt.accountId;
        this.operatorKey = key;
        this.nodeAccountIds = [resp.nodeId]
        this.client.setOperator(this.operatorId, this.operatorKey);

        expect(this.client.operatorAccountId).to.not.be.null;
        expect(this.client.operatorPublicKey).to.not.be.null;

        return this;
    }
}
