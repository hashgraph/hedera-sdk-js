import IntegrationTestEnv from "./client/index.js";
import {
    AccountBalanceQuery,
    AccountInfoQuery,
    AccountId,
} from "../src/exports.js";

describe("ClientIntegration", function () {
    it("should be executable", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const oldNetwork = env.client.network;

        await new AccountBalanceQuery()
            .setNodeAccountIds([new AccountId(3)])
            .setAccountId("3")
            .execute(env.client);

        let which = "";

        let newNetwork = {};

        if (oldNetwork["35.237.200.180:50211"] != null) {
            which = "node_mainnet";
        }

        if (oldNetwork["0.testnet.hedera.com:50211"] != null) {
            which = "node_testnet";
        }

        if (oldNetwork["0.previewnet.hedera.com:50211"] != null) {
            which = "node_previewnet";
        }

        if (oldNetwork["https://grpc-web.myhbarwallet.com"] != null) {
            which = "web_mainnet";
        }

        if (oldNetwork["https://grpc-web.testnet.myhbarwallet.com"] != null) {
            which = "web_testnet";
        }

        if (
            oldNetwork["https://grpc-web.previewnet.myhbarwallet.com"] != null
        ) {
            which = "web_previewnet";
        }

        env.client.setNetwork(newNetwork);

        let err = false;

        try {
            await new AccountBalanceQuery()
                .setNodeAccountIds([new AccountId(3)])
                .setAccountId("3")
                .execute(env.client);
        } catch (error) {
            err = error
                .toString()
                .includes("NodeAccountId not recognized: 0.0.3");
        }

        if (!err) {
            throw new Error("query did not error");
        }

        switch (which) {
            case "node_mainnet":
                oldNetwork["35.237.200.180:50211"] = new AccountId(3);
                break;
            case "node_testnet":
                oldNetwork["0.testnet.hedera.com:50211"] = new AccountId(3);
                break;
            case "node_previewnet":
                oldNetwork["0.previewnet.hedera.com:50211"] = new AccountId(3);
                break;
            case "web_mainnet":
                oldNetwork["https://grpc-web.myhbarwallet.com"] = new AccountId(
                    3
                );
                break;
            case "web_testnet":
                oldNetwork["https://grpc-web.testnet.myhbarwallet.com"] =
                    new AccountId(3);
                break;
            case "web_previewnet":
                oldNetwork["https://grpc-web.previewnet.myhbarwallet.com"] =
                    new AccountId(3);
                break;
        }

        env.client.setNetwork(oldNetwork);

        await new AccountBalanceQuery()
            .setNodeAccountIds([new AccountId(3)])
            .setAccountId("3")
            .execute(env.client);
    });

    it("should error when invalid network on entity ID", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        if (env.client._networkName == null) {
            return;
        }

        let err = false;

        let network;
        switch (env.client._networkName) {
            case "mainnet":
                network = "testnet";
                break;
            case "testnet":
                network = "previewnet";
                break;
            case "previewnet":
                network = "mainnet";
                break;
            default:
                throw new Error(
                    `(BUG) operator network is unrecognized value: ${env.client._networkName}`
                );
        }

        const accountId = AccountId.withNetwork(3, network);

        try {
            await new AccountInfoQuery()
                .setAccountId(accountId)
                .execute(env.client);
        } catch (error) {
            err = true;
        }

        if (!err) {
            throw new Error("query did not error");
        }
    });
});
