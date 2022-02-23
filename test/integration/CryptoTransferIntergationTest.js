import {
    AccountCreateTransaction,
    AccountDeleteTransaction,
    Hbar,
    PrivateKey,
    Status,
    TransactionId,
    AccountId,
    TransferTransaction,
    Transaction,
} from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";
import { Client } from "../../src/index.js";

describe("CryptoTransfer", function () {
    it("should not require node account IDs to be explicitly set", async function () {
        this.timeout(120000);

        const operatorId = AccountId.fromString("0.0.9523");
        const operatorKey = PrivateKey.fromString(
            "91dad4f120ca225ce66deb1d6fb7ecad0e53b5e879aa45b0c5e0db7923f26d08"
        );

        const client = Client.forTestnet();

        let transaction = new TransferTransaction()
            .setTransactionId(TransactionId.generate(operatorId))
            .addHbarTransfer(operatorId, -1)
            .addHbarTransfer(AccountId.fromString("0.0.3"), 1)
            .freezeWith(client);

        const bytes = transaction.toBytes();

        transaction = Transaction.fromBytes(bytes);
        transaction = await transaction.sign(operatorKey);

        await (await transaction.execute(client)).getReceipt(client);
    });

    it("should be executable", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        const key = PrivateKey.generateED25519();

        const response = await new AccountCreateTransaction()
            .setKey(key)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        await (
            await new TransferTransaction()
                .addHbarTransfer(account, new Hbar(1))
                .addHbarTransfer(operatorId, new Hbar(-1))
                .execute(env.client)
        ).getReceipt(env.client);

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

    it("should error when there is invalid account amounts", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        const key = PrivateKey.generateED25519();

        const response = await new AccountCreateTransaction()
            .setKey(key)
            .setInitialBalance(new Hbar(0))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        let err = false;

        try {
            await (
                await new TransferTransaction()
                    .addHbarTransfer(account, new Hbar(1))
                    .addHbarTransfer(operatorId, new Hbar(1))
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidAccountAmounts);
        }

        if (!err) {
            throw new Error("Crypto transfer did not error.");
        }

        await env.close();
    });

    it("should error when receiver and sender are the same accounts", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();
        const key = PrivateKey.generateED25519();

        const response = await new AccountCreateTransaction()
            .setKey(key)
            .setInitialBalance(new Hbar(1))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        let err = false;

        try {
            await (
                await new TransferTransaction()
                    .addHbarTransfer(account, new Hbar(1))
                    .addHbarTransfer(account, new Hbar(-1))
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            console.log(error);
            err = error
                .toString()
                .includes(Status.AccountRepeatedInAccountAmounts);
        }

        if (!err) {
            throw new Error("Crypto transfer did not error.");
        }

        await env.close();
    });
});
