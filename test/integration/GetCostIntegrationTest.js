import {
    AccountBalanceQuery,
    AccountInfoQuery,
    Hbar,
    Status,
} from "../src/exports.js";
import IntegrationTestEnv from "./client/index.js";

describe("GetCost", function () {
    it("should be executable", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;

        const cost = await new AccountInfoQuery()
            .setNodeAccountIds(env.nodeAccountIds)
            .setAccountId(operatorId)
            .getCost(env.client);

        await new AccountInfoQuery()
            .setAccountId(operatorId)
            .setQueryPayment(cost)
            .execute(env.client);
    });

    it("should be executable when max query payment is large", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const operatorId = env.operatorId;

        env.client.setMaxQueryPayment(new Hbar(100));

        const cost = await new AccountInfoQuery()
            .setNodeAccountIds(env.nodeAccountIds)
            .setAccountId(operatorId)
            .getCost(env.client);

        await new AccountInfoQuery()
            .setAccountId(operatorId)
            .setQueryPayment(cost)
            .execute(env.client);
    });

    it("should be executable when max query payment is small", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const operatorId = env.operatorId;

        env.client.setMaxQueryPayment(new Hbar(1));

        const cost = await new AccountInfoQuery()
            .setNodeAccountIds(env.nodeAccountIds)
            .setAccountId(operatorId)
            .getCost(env.client);

        await new AccountInfoQuery()
            .setAccountId(operatorId)
            .setQueryPayment(cost)
            .execute(env.client);
    });

    it("should be executable when free queries have set zero cost", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const operatorId = env.operatorId;

        await new AccountInfoQuery()
            .setNodeAccountIds(env.nodeAccountIds)
            .setAccountId(operatorId)
            .setQueryPayment(new Hbar(1))
            .execute(env.client);

        await new AccountBalanceQuery()
            .setAccountId(operatorId)
            .setNodeAccountIds(env.nodeAccountIds)
            .setQueryPayment(new Hbar(0))
            .execute(env.client);
    });

    it("should be executable when paid queries have set large cost", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const operatorId = env.operatorId;

        await new AccountInfoQuery()
            .setNodeAccountIds(env.nodeAccountIds)
            .setAccountId(operatorId)
            .setQueryPayment(new Hbar(10))
            .execute(env.client);

        await new AccountBalanceQuery()
            .setAccountId(operatorId)
            .setNodeAccountIds(env.nodeAccountIds)
            .setQueryPayment(new Hbar(0))
            .execute(env.client);
    });

    it("should error when paid query are set to zero", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const operatorId = env.operatorId;

        let err = false;
        try {
            await new AccountInfoQuery()
                .setAccountId(operatorId)
                .setNodeAccountIds(env.nodeAccountIds)
                .setQueryPayment(new Hbar(0))
                .execute(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InsufficientTxFee);
        }

        if (!err) {
            throw new Error("GetCost did not error");
        }
    });
});
