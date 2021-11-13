import Client from "../../src/client/WebClient.js";
import BaseIntegrationTestEnv from "./BaseIntegrationTestEnv.js";

export { Client };

export function skipTestDueToNodeJsVersion() {
    return true;
}

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
            env: {
                OPERATOR_ID: "0.0.47439",
                OPERATOR_KEY: "302e020100300506032b6570042204208f4014a3f7f7a6c7147070da98d88f9cea074c13ed0554783471825d801888cf",
                HEDERA_NETWORK: "testnet",
            },
            nodeAccountIds: options.nodeAccountIds,
            balance: options.balance,
            throwaway: options.throwaway,
        });
    }
}
