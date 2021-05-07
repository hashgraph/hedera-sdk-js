import Hbar from "../src/Hbar.js";
import Status from "../src/Status.js";
import newClient from "./client/index.js";
import { AccountStakersQuery } from "../../src/exports.js";

describe("AccountStakers", function () {
    it("should error", async function () {
        this.timeout(15000);

        const env = await newClient.new();
        const operatorId = env.operatorId;

        let err = false;

        try {
            await new AccountStakersQuery()
                .setAccountId(operatorId)
                .setNodeAccountIds(env.nodeAccountIds)
                .setMaxQueryPayment(new Hbar(1))
                .execute(env.client);
        } catch (error) {
            err = error.toString().includes(Status.NotSupported.toString());
        }

        if (!err) {
            throw new Error("query did not error");
        }
    });
});
