import {
    Status,
    AccountBalanceQuery,
    TokenCreateTransaction,
    AccountId,
} from "../src/exports.js";
import IntegrationTestEnv, {
    Client,
    skipTestDueToNodeJsVersion,
} from "./client/index.js";

describe("AccountBalanceQuery", function () {
    it("can connect to previewnet with TLS", async function () {
        this.timeout(30000);
        if (skipTestDueToNodeJsVersion(16)) {
            return;
        }

        const client = Client.forPreviewnet().setTransportSecurity(true);

        for (const [address, nodeAccountId] of Object.entries(client.network)) {
            expect(address.endsWith(":50212")).to.be.true;

            await new AccountBalanceQuery()
                .setNodeAccountIds([nodeAccountId])
                .setAccountId(nodeAccountId)
                .setMaxAttempts(1)
                .execute(client);
        }
    });

    it("can connect to testnet with TLS", async function () {
        this.timeout(30000);

        if (skipTestDueToNodeJsVersion(16)) {
            return;
        }

        const client = Client.forTestnet().setTransportSecurity(true);

        for (const [address, nodeAccountId] of Object.entries(client.network)) {
            expect(address.endsWith(":50212")).to.be.true;

            await new AccountBalanceQuery()
                .setNodeAccountIds([nodeAccountId])
                .setAccountId(nodeAccountId)
                .setMaxAttempts(1)
                .execute(client);
        }
    });

    it("an account that does not exist should return an error", async function () {
        this.timeout(120000);

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
        this.timeout(120000);

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
