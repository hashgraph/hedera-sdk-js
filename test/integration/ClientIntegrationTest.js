import {
    AccountCreateTransaction,
    AccountDeleteTransaction,
    AccountId,
    AccountInfoQuery,
    Hbar,
    LedgerId,
    PrivateKey,
    TransactionId,
} from "../../src/exports.js";
import IntegrationTestEnv, { Client } from "./client/NodeIntegrationTestEnv.js";

describe("ClientIntegration", function () {
    let env;
    let clientTestnet;
    let clientPreviewNet;

    before(async function () {
        env = await IntegrationTestEnv.new();
        clientTestnet = Client.forTestnet();
        clientPreviewNet = Client.forPreviewnet();
    });

    it("should error when invalid network on entity ID", async function () {
        if (env.client.ledgerId == null) {
            return;
        }

        let err = false;

        let network;
        switch (env.client.ledgerId.toString()) {
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
                    `(BUG) operator network is unrecognized value: ${env.client.ledgerId.toString()}`,
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
        env.client.setSignOnDemand(true);

        const operatorId = env.operatorId;
        const key = PrivateKey.generateED25519();

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
            new Hbar(2).toTinybars().toNumber(),
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
    });

    it("can get bytes without sign on demand", async function () {
        env.client.setSignOnDemand(false);

        const key = PrivateKey.generateED25519();

        const bytes = (
            await new AccountCreateTransaction()
                .setKey(key.publicKey)
                .setInitialBalance(new Hbar(2))
                .freezeWith(env.client)
                .sign(key)
        ).toBytes();
        expect(bytes.length).to.be.gt(0);
    });

    it("can pingAll", async function () {
        await env.client.pingAll();
    });

    it("should fail on ping", async function () {
        let error = null;
        try {
            await env.client.ping(""); // Non exist Node ID
        } catch (err) {
            error = err;
        }
        expect(error).to.be.an("Error");
    });

    // TODO(2023-11-01 NK) - test is consistently failing and should be enabled once fixed.
    // eslint-disable-next-line mocha/no-skipped-tests
    xit("can set network name on custom network", async function () {
        expect(clientTestnet.ledgerId).to.be.equal(LedgerId.TESTNET);
        expect(clientPreviewNet.ledgerId).to.be.equal(LedgerId.PREVIEWNET);

        await clientTestnet.setNetwork(clientPreviewNet.network);

        expect(clientTestnet.ledgerId).to.be.null;

        clientTestnet.setLedgerId("previewnet");

        expect(clientTestnet.ledgerId).to.be.equal(LedgerId.PREVIEWNET);
    });

    it("can use same proxies of one node", async function () {
        let nodes = {
            "0.testnet.hedera.com:50211": new AccountId(3),
            "34.94.106.61:50211": new AccountId(3),
            "50.18.132.211:50211": new AccountId(3),
            "138.91.142.219:50211": new AccountId(3),
        };

        const clientForNetwork = Client.forNetwork(nodes);
        await clientForNetwork.pingAll();
    });

    it("should return a boolean for client transport security", function () {
        expect(clientTestnet.isTransportSecurity()).to.be.an("boolean");
    });

    it("should return the following error message `defaultMaxQueryPayment must be non-negative` when the user tries to set a negative value to the defaultMaxQueryPayment field", async function () {
        try {
            env.client.setDefaultMaxQueryPayment(new Hbar(1).negated());
        } catch (error) {
            expect(error.message).to.be.equal(
                "defaultMaxQueryPayment must be non-negative",
            );
        }
    });

    it("should set defaultMaxQueryPayment field", async function () {
        const value = new Hbar(100);
        env.client.setDefaultMaxQueryPayment(value);
        expect(env.client.defaultMaxQueryPayment).to.be.equal(value);
    });

    after(async function () {
        await env.close();
        clientTestnet.close();
        clientPreviewNet.close();
    });
});
