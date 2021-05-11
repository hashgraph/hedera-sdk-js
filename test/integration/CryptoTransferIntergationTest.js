import {
    AccountCreateTransaction,
    AccountDeleteTransaction,
    TransferTransaction,
    Hbar,
    PrivateKey,
    TransactionId,
    Status,
} from "../src/exports.js";
import IntegrationTestEnv from "./client/index.js";

describe("CryptoTransfer", function () {
    it("should be executable", async function () {
        this.timeout(20000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key)
            .setNodeAccountIds(env.nodeAccountIds)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        await (
            await new TransferTransaction()
                .setNodeAccountIds([response.nodeId])
                .addHbarTransfer(account, new Hbar(1))
                .addHbarTransfer(operatorId, new Hbar(-1))
                .execute(env.client)
        ).getReceipt(env.client);

        await (
            await (
                await new AccountDeleteTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .setAccountId(account)
                    .setNodeAccountIds([response.nodeId])
                    .setTransferAccountId(operatorId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(env.client)
                    .sign(key)
            ).execute(env.client)
        ).getReceipt(env.client);
    });

    it("should error when there is invalid account amounts", async function () {
        this.timeout(10000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key)
            .setNodeAccountIds(env.nodeAccountIds)
            .setInitialBalance(new Hbar(0))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        let err = false;

        try {
            await (
                await new TransferTransaction()
                    .setNodeAccountIds([response.nodeId])
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
    });

    it("should error when receiver and sender are the same accounts", async function () {
        this.timeout(10000);

        const env = await IntegrationTestEnv.new();
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key)
            .setNodeAccountIds(env.nodeAccountIds)
            .setInitialBalance(new Hbar(1))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        let err = false;

        try {
            await (
                await new TransferTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .addHbarTransfer(account, new Hbar(1))
                    .addHbarTransfer(account, new Hbar(-1))
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error
                .toString()
                .includes(Status.AccountRepeatedInAccountAmounts);
        }

        if (!err) {
            throw new Error("Crypto transfer did not error.");
        }
    });
});
