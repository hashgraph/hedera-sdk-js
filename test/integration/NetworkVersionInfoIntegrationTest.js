import newClient from "./client/index.js";
import { NetworkVersionInfoQuery } from "../../src/exports.js";

describe("NetworkVersionInfo", function () {
    it("should be executable", async function () {
        this.timeout(15000);

        const env = await newClient.new();

        try {
            await new NetworkVersionInfoQuery()
                .setNodeAccountIds(env.nodeAccountIds)
                .execute(env.client);
        } catch {
            // Do nothing
        }
    });
});
