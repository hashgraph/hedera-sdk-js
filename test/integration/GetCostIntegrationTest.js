import {
    AccountBalanceQuery,
    AccountInfoQuery,
    Hbar,
    Status,
} from "../src/exports.js";
import newClient from "./client/index.js";

describe("GetCost", function () {
    it("should be executable", async function () {
        this.timeout(15000);

        const client = await newClient();
        const operatorId = client.operatorAccountId;

        const cost = await new AccountInfoQuery()
            .setAccountId(operatorId)
            .getCost(client);

        await new AccountInfoQuery()
            .setAccountId(operatorId)
            .setQueryPayment(cost)
            .execute(client);
    });

    it("should be executable when max query payment is large", async function () {
        this.timeout(15000);

        const client = await newClient();

        const operatorId = client.operatorAccountId;

        client.setMaxQueryPayment(new Hbar(100));

        const cost = await new AccountInfoQuery()
            .setAccountId(operatorId)
            .getCost(client);

        await new AccountInfoQuery()
            .setAccountId(operatorId)
            .setQueryPayment(cost)
            .execute(client);
    });

    it("should be executable when max query payment is small", async function () {
        this.timeout(15000);

        const client = await newClient();

        const operatorId = client.operatorAccountId;

        client.setMaxQueryPayment(new Hbar(1));

        const cost = await new AccountInfoQuery()
            .setAccountId(operatorId)
            .getCost(client);

        await new AccountInfoQuery()
            .setAccountId(operatorId)
            .setQueryPayment(cost)
            .execute(client);
    });

    it("should be executable when free queries have set zero cost", async function () {
        this.timeout(15000);

        const client = await newClient();

        const operatorId = client.operatorAccountId;

        await new AccountInfoQuery()
            .setAccountId(operatorId)
            .setQueryPayment(new Hbar(100))
            .execute(client);

        await new AccountBalanceQuery()
            .setAccountId(operatorId)
            .setQueryPayment(new Hbar(0))
            .execute(client);
    });

    it("should be executable when paid queries have set large cost", async function () {
        this.timeout(15000);

        const client = await newClient();

        const operatorId = client.operatorAccountId;

        await new AccountInfoQuery()
            .setAccountId(operatorId)
            .setQueryPayment(new Hbar(100))
            .execute(client);

        await new AccountBalanceQuery()
            .setAccountId(operatorId)
            .setQueryPayment(new Hbar(0))
            .execute(client);
    });

    it("should error when paid query are set to zero", async function () {
        this.timeout(15000);

        const client = await newClient();

        const operatorId = client.operatorAccountId;

        let err = false;
        try {
            await new AccountInfoQuery()
                .setAccountId(operatorId)
                .setQueryPayment(new Hbar(0))
                .execute(client);
        } catch (error) {
            err = error.toString().includes(Status.InsufficientTxFee);
        }

        if (!err) {
            throw new Error("GetCost did not error");
        }
    });
});