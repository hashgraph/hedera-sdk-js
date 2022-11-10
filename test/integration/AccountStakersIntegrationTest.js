import { AccountStakersQuery, Hbar, Status } from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("AccountStakers", function () {
    let env;

    before(async function () {
        env = await IntegrationTestEnv.new();
    });

    it("should error", async function () {
        this.timeout(120000);

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

    after(async function () {
        await env.close();
    });
});
