import Client from "../../../src/client/NodeClient.js";
import BaseIntegrationTestEnv from "./BaseIntegrationTestEnv.js";

export { Client };

export function skipTestDueToNodeJsVersion() {
    return true;
}

export default class TestnetIntegrationTestEnv extends BaseIntegrationTestEnv {
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
                OPERATOR_ID: "0.0.4481103",
                OPERATOR_KEY:
                    "3d11515c6794311c87dfdeaac90d4c223c22f3634db8f24690b557ea0ca97c11",
                HEDERA_NETWORK: "testnet",
            },
            nodeAccountIds: options.nodeAccountIds,
            balance: options.balance,
            throwaway: options.throwaway,
        });
    }
}
