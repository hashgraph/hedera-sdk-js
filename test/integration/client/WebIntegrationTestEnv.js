import Client from "../../src/client/WebClient.js";
import BaseIntegrationTestEnv from "./BaseIntegrationTestEnv.js";

export { Client };

export default class IntegrationTestEnv extends BaseIntegrationTestEnv {
    /**
     * @param {object} [options]
     * @property {number} [options.nodeAccountIds]
     * @property {number} [options.balance]
     * @property {boolean} [options.throwaway]
     */
    static async new(options = {}) {
        import.meta.env.OPERATOR_KEY = import.meta.env.VITE_OPERATOR_KEY;
        import.meta.env.OPERATOR_ID = import.meta.env.VITE_OPERATOR_ID;
        import.meta.env.HEDERA_NETWORK = import.meta.env.VITE_HEDERA_NETWORK;

        return BaseIntegrationTestEnv.new({
            client: Client,
            env: import.meta.env,
            nodeAccountIds: options.nodeAccountIds,
            balance: options.balance,
            throwaway: options.throwaway,
        });
    }
}
