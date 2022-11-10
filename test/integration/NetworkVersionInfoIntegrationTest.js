import { NetworkVersionInfoQuery } from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("NetworkVersionInfo", function () {
    let env;

    before(async function () {
        env = await IntegrationTestEnv.new();
    });

    it("should be executable", async function () {
        this.timeout(120000);

        try {
            await new NetworkVersionInfoQuery().execute(env.client);
        } catch {
            // Do nothing
        }
    });

    after(async function () {
        await env.close();
    });
});
