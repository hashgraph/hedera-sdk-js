import {
    AccountCreateTransaction,
    AccountDeleteTransaction,
    AccountId,
    AccountInfoQuery,
    Hbar,
    LedgerId,
    PrivateKey,
    TransactionId,
} from "../src/exports.js";
import IntegrationTestEnv, { Client } from "./client/NodeIntegrationTestEnv.js";

describe("ClientIntegration", function () {
    it("should error when invalid network on entity ID", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();

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
                    `(BUG) operator network is unrecognized value: ${env.client.ledgerId.toString()}`
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
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();
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
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();
        const key = PrivateKey.generateED25519();

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
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();

        await env.client.pingAll();

        await env.close();
    });

    it("can set network name on custom network", async function () {
        const testnetClient = Client.forTestnet();
        const previewnetClient = Client.forPreviewnet();

        expect(testnetClient.ledgerId).to.be.equal(LedgerId.TESTNET);
        expect(previewnetClient.ledgerId).to.be.equal(LedgerId.PREVIEWNET);

        testnetClient.setNetwork(previewnetClient.network);

        expect(testnetClient.ledgerId).to.be.null;

        testnetClient.setLedgerId("previewnet");

        expect(testnetClient.ledgerId).to.be.equal(LedgerId.PREVIEWNET);

        testnetClient.close();
        previewnetClient.close();
    });
});
