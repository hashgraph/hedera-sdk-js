import Client from "../../src/client/NodeClient.js";
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
        return BaseIntegrationTestEnv.new({
            client: Client,
            env: process.env,
            nodeAccountIds: options.nodeAccountIds,
            balance: options.balance,
            throwaway: options.throwaway,
        });
    }
}
