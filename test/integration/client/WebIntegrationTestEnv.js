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
                OPERATOR_ID: "0.0.8920",
                OPERATOR_KEY:
                    "07f9f9c355d32c5c93a50024b596ed3ccc39954ba1963c68ac21cb7802fd5f83",
                HEDERA_NETWORK: "testnet",
            },
            nodeAccountIds: options.nodeAccountIds,
            balance: options.balance,
            throwaway: options.throwaway,
        });
    }
}
