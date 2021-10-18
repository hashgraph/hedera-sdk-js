import {
    Status,
    AccountBalanceQuery,
    AccountCreateTransaction,
    TokenCreateTransaction,
    AccountId,
    PrivateKey,
} from "../src/exports.js";
import { RST_STREAM } from "../src/Executable.js";
import IntegrationTestEnv, { Client } from "./client/NodeIntegrationTestEnv.js";
import chai from "chai";
import spies from "chai-spies";

chai.use(spies);

describe("AccountBalanceQuery", function () {
    it("retries on error", async function() {
        this.timeout(60000);

        const client = Client.forMainnet();

        const query = new AccountBalanceQuery()
            .setMaxAttempts(2)
            .setAccountId(new AccountId(4))
            .setNodeAccountIds([new AccountId(4)]);

        var shouldRetryExceptionally = chai.spy.on(query, '_shouldRetryExceptionally');

        try {
            await query.execute(client);
        } catch (error) {
            expect(RST_STREAM.test(error.toString())).to.be.true;
        }

        expect(shouldRetryExceptionally).to.have.been.called.twice;
    });

    it("transaction retries on error", async function() {
        this.timeout(60000);

        // Random operator
        const key = PrivateKey.generate();
        const accountId = new AccountId(10);

        const client = Client.forMainnet()
            .setOperator(accountId, key);

        const transaction = new AccountCreateTransaction()
            .setMaxAttempts(2)
            .setKey(PrivateKey.generate().publicKey)
            .setNodeAccountIds([new AccountId(4)]);

        var shouldRetryExceptionally = chai.spy.on(transaction, '_shouldRetryExceptionally');

        try {
            await transaction.execute(client);
        } catch (error) {
            expect(RST_STREAM.test(error.toString())).to.be.true;
        }

        expect(shouldRetryExceptionally).to.have.been.called.twice;
    });

    it("an account that does not exist should return an error", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        let err = false;

        try {
            await new AccountBalanceQuery()
                .setAccountId("1.0.3")
                .execute(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidAccountId.toString());
        }

        if (!err) {
            throw new Error("query did not error");
        }

        await env.close();
    });

    it("should error", async function () {
        this.timeout(60000);

        const client = Client.forNetwork({
            "35.237.200.180:50211": new AccountId(3),
            "35.242.233.154:50211": new AccountId(10),
        });

        let err = false;

        try {
            await new AccountBalanceQuery()
                .setMaxAttempts(3)
                .setNodeAccountIds([new AccountId(10)])
                .setAccountId(new AccountId(10))
                .execute(client);
        } catch (error) {
            err = error.toString().includes("UNAVAILABLE");
        }

        if (!err) {
            throw new Error("AccountBalanceQuery on node 10 did not error");
        }

        await new AccountBalanceQuery()
            .setMaxAttempts(3)
            .setNodeAccountIds([new AccountId(10), new AccountId(3)])
            .setAccountId(new AccountId(10))
            .execute(client);
    });

    it("should reflect token with no keys", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new({ throwaway: true });
        const operatorId = env.operatorId;

        const token = (
            await (
                await new TokenCreateTransaction()
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(operatorId)
                    .execute(env.client)
            ).getReceipt(env.client)
        ).tokenId;

        const balances = await new AccountBalanceQuery()
            .setAccountId(env.operatorId)
            .execute(env.client);

        expect(balances.tokens.get(token).toInt()).to.be.equal(0);

        await env.close();
    });
});
