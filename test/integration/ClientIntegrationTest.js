import IntegrationTestEnv from "./client/index.js";
import {
    AccountBalanceQuery,
    AccountId,
    Hbar,
    PrivateKey,
    AccountInfoQuery,
    AccountCreateTransaction,
    AccountDeleteTransaction,
    TransactionId,
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

    it("can execute with sign on demand", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        env.client.setSignOnDemand(true);

        const operatorId = env.operatorId;
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key.publicKey)
            .setNodeAccountIds(env.nodeAccountIds)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        const info = await new AccountInfoQuery()
            .setNodeAccountIds([response.nodeId])
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
                    .setNodeAccountIds([response.nodeId])
                    .setTransferAccountId(operatorId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(env.client)
                    .sign(key)
            ).execute(env.client)
        ).getReceipt(env.client);
    });

    it("can get bytes without sign on demand", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const key = PrivateKey.generate();

        const bytes = (
            await new AccountCreateTransaction()
                .setKey(key.publicKey)
                .setNodeAccountIds(env.nodeAccountIds)
                .setInitialBalance(new Hbar(2))
                .freezeWith(env.client)
                .sign(key)
        ).toBytes();

        expect(bytes.length).to.be.gt(0);
    });
});
