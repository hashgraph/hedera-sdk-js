import Hbar from "../src/Hbar.js";
import Status from "../src/Status.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";
import { AccountStakersQuery } from "../../src/exports.js";

describe("AccountStakers", function () {
    it("should error", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;

        let err = false;

        try {
            await new AccountStakersQuery()
                .setAccountId(operatorId)
                .setMaxQueryPayment(new Hbar(1))
                .execute(env.client);
        } catch (error) {
            err = error.toString().includes(Status.NotSupported.toString());
        }

        if (!err) {
            throw new Error("query did not error");
        }

        await env.close();
    });
});
