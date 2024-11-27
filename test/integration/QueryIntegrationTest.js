import { expect } from "chai";

import { AccountId, AccountInfoQuery } from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("Transaction flows", function () {
    let env, operatorId, operatorKey, client;

    // Setting up the environment and creating a new account with a key list
    before(async function () {
        env = await IntegrationTestEnv.new();
        client = env.client;
    });

    it("Execute Query with invalid accountId within an array with valid one", async function () {
        const signTransferTransaction = new AccountInfoQuery()
            .setAccountId("0.0.3")
            .setNodeAccountIds([
                // invalid node account id
                new AccountId(111),
                // valid node account id
                new AccountId(3),
            ]);

        await signTransferTransaction.execute(client);
    });

    it("Execute Query with only invalid accountId ", async function () {
        const signTransferTransaction = new AccountInfoQuery()
            .setAccountId("0.0.3")
            .setNodeAccountIds([
                // invalid node account id
                new AccountId(111),
            ]);

        try {
            await signTransferTransaction.execute(client);
        } catch (error) {
            expect(error.message).to.be.equal(
                "max attempts of 10 was reached for request with last error being: ",
            );
        }
    });
});
