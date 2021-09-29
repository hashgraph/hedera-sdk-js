import IntegrationTestEnv, { Client } from "./client/NodeIntegrationTestEnv.js";
import {
    AccountBalanceQuery,
    AccountId,
    Hbar,
    PrivateKey,
    AccountInfoQuery,
    AccountCreateTransaction,
    AccountDeleteTransaction,
    TransactionId,
    NetworkName,
} from "../src/exports.js";

describe("ClientIntegration", function () {
    it("should be executable", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new({ nodeAccountIds: 100 });

        const oldNetwork = env.client.network;

        await new AccountBalanceQuery().setAccountId("3").execute(env.client);

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

        await new AccountBalanceQuery().setAccountId("3").execute(env.client);

        await env.close();
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

        await env.close();
    });

    it("can execute with sign on demand", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        env.client.setSignOnDemand(true);

        const operatorId = env.operatorId;
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key.publicKey)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        const info = await new AccountInfoQuery()
            .setAccountId(account)
            .execute(env.client);

        expect(info.accountId.toString()).to.be.equal(account.toString());
        expect(info.isDeleted).to.be.false;
        expect(info.key.toString()).to.be.equal(key.publicKey.toString());
        expect(info.balance.toTinybars().toNumber()).to.be.equal(
            new Hbar(2).toTinybars().toNumber()
        );
        expect(info.autoRenewPeriod.seconds.toNumber()).to.be.equal(7776000);
        expect(info.proxyAccountId).to.be.null;
        expect(info.proxyReceived.toTinybars().toNumber()).to.be.equal(0);

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setTransferAccountId(operatorId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(env.client)
                    .sign(key)
            ).execute(env.client)
        ).getReceipt(env.client);

        await env.close();
    });

    it("can get bytes without sign on demand", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const key = PrivateKey.generate();

        const bytes = (
            await new AccountCreateTransaction()
                .setKey(key.publicKey)
                .setInitialBalance(new Hbar(2))
                .freezeWith(env.client)
                .sign(key)
        ).toBytes();

        expect(bytes.length).to.be.gt(0);

        await env.close();
    });

    it("can pingAll", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        await env.client.pingAll();

        await env.close();
    });

    it("can set network name on custom network", async function () {
        const testnetClient = Client.forTestnet();
        const previewnetClient = Client.forPreviewnet();

        expect(testnetClient.networkName).to.be.equal(NetworkName.Testnet);
        expect(previewnetClient.networkName).to.be.equal(
            NetworkName.Previewnet
        );

        testnetClient.setNetwork(previewnetClient.network);

        expect(testnetClient.networkName).to.be.null;

        testnetClient.setNetworkName("previewnet");

        expect(testnetClient.networkName).to.be.equal(NetworkName.Previewnet);

        testnetClient.close();
        previewnetClient.close();
    });

    it("should correctly construct and update network", async function () {
        let nodes = {
            "0.testnet.hedera.com:50211": "0.0.3",
        };

        const client = Client.forNetwork(nodes);

        let network = client.network;

        expect(Object.entries(network).length).to.be.equal(1);
        expect(network["0.testnet.hedera.com:50211"].toString()).to.be.equal(
            "0.0.3"
        );

        client.setNetwork(nodes);
        network = client.network;

        expect(Object.entries(network).length).to.be.equal(1);
        expect(network["0.testnet.hedera.com:50211"].toString()).to.be.equal(
            "0.0.3"
        );

        nodes["1.testnet.hedera.com:50211"] = "0.0.4";

        client.setNetwork(nodes);
        network = client.network;

        expect(Object.entries(network).length).to.be.equal(2);
        expect(network["0.testnet.hedera.com:50211"].toString()).to.be.equal(
            "0.0.3"
        );
        expect(network["1.testnet.hedera.com:50211"].toString()).to.be.equal(
            "0.0.4"
        );

        nodes["2.testnet.hedera.com:50211"] = "0.0.5";

        client.setNetwork(nodes);
        network = client.network;

        expect(Object.entries(network).length).to.be.equal(3);
        expect(network["0.testnet.hedera.com:50211"].toString()).to.be.equal(
            "0.0.3"
        );
        expect(network["1.testnet.hedera.com:50211"].toString()).to.be.equal(
            "0.0.4"
        );
        expect(network["2.testnet.hedera.com:50211"].toString()).to.be.equal(
            "0.0.5"
        );

        nodes = {
            "2.testnet.hedera.com:50211": "0.0.5",
        };

        client.setNetwork(nodes);
        network = client.network;

        expect(Object.entries(network).length).to.be.equal(1);
        expect(network["2.testnet.hedera.com:50211"].toString()).to.be.equal(
            "0.0.5"
        );

        nodes = {
            "2.testnet.hedera.com:50211": "0.0.6",
        };

        client.setNetwork(nodes);
        network = client.network;

        expect(Object.entries(network).length).to.be.equal(1);
        expect(network["2.testnet.hedera.com:50211"].toString()).to.be.equal(
            "0.0.6"
        );
    });

    it("should correctly construct and update mirror network", async function () {
        let nodes = ["hcs.testnet.mirrornode.hedera.com:5600"];

        const client = Client.forNetwork({}).setMirrorNetwork(nodes);

        let network = client.mirrorNetwork;

        expect(network.length).to.be.equal(1);
        expect(network.includes("hcs.testnet.mirrornode.hedera.com:5600")).to.be
            .true;

        client.setMirrorNetwork(nodes);
        network = client.mirrorNetwork;

        expect(network.length).to.be.equal(1);
        expect(network.includes("hcs.testnet.mirrornode.hedera.com:5600")).to.be
            .true;

        nodes.push("hcs.testnet1.mirrornode.hedera.com:5600");

        client.setMirrorNetwork(nodes);
        network = client.mirrorNetwork;

        expect(network.length).to.be.equal(2);
        expect(network.includes("hcs.testnet.mirrornode.hedera.com:5600")).to.be
            .true;
        expect(network.includes("hcs.testnet1.mirrornode.hedera.com:5600")).to
            .be.true;

        nodes = ["hcs.testnet1.mirrornode.hedera.com:5600"];

        client.setMirrorNetwork(nodes);
        network = client.mirrorNetwork;

        expect(network.length).to.be.equal(1);
        expect(network.includes("hcs.testnet1.mirrornode.hedera.com:5600")).to
            .be.true;
    });
});
