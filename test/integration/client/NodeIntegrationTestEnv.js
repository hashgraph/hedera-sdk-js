import Client from "../../../src/client/NodeClient.js";
import BaseIntegrationTestEnv from "./BaseIntegrationTestEnv.js";
import dotenv from "dotenv";

dotenv.config();

export { Client };

/**
 * @typedef {number} minVersion
 */
export function skipTestDueToNodeJsVersion(minVersion) {
    if (
        process == null ||
        process.versions == null ||
        process.versions.node == null ||
        parseInt(process.versions.node.split(".")[0]) < minVersion
    ) {
        console.log("skipping test due to unsupported nodejs version");
        return true;
    }
}

export default class IntegrationTestEnv extends BaseIntegrationTestEnv {
    /**
     * @param {object} [options]
     * @property {number} [options.nodeAccountIds]
     * @property {number} [options.balance]
     * @property {boolean} [options.throwaway]
     */
    static async new(options = {}) {
        console.log(process.env.OPERATOR_ID);
        return BaseIntegrationTestEnv.new({
            client: Client,
            env: process.env,
            nodeAccountIds: options.nodeAccountIds,
            balance: options.balance,
            throwaway: options.throwaway,
        });
    }
}
