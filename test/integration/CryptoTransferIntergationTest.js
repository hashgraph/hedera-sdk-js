import {
    AccountCreateTransaction,
    AccountDeleteTransaction,
    TransferTransaction,
    Hbar,
    PrivateKey,
    TransactionId,
    Status,
} from "../src/exports.js";
import newClient from "./client/index.js";

describe("CryptoTransfer", function () {
    it("should be executable", async function () {
        this.timeout(20000);

        const client = await newClient();
        const operatorId = client.operatorAccountId;
        const operatorKey = client.operatorPublicKey;
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key)
            .setInitialBalance(new Hbar(2))
            .execute(client);

        const receipt = await response.getReceipt(client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        await (
            await new TransferTransaction()
                .setNodeAccountIds([response.nodeId])
                .addHbarTransfer(account, new Hbar(100))
                .addHbarTransfer(operatorId, new Hbar(-100))
                .execute(client)
        ).getReceipt(client);

        await (
            await (
                await new AccountDeleteTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .setAccountId(account)
                    .setNodeAccountIds([response.nodeId])
                    .setTransferAccountId(operatorId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(client)
                    .sign(key)
            ).execute(client)
        ).getReceipt(client);
    });

    it("should error when there is invalid account amounts", async function () {
        this.timeout(10000);

        const client = await newClient();
        const operatorId = client.operatorAccountId;
        const operatorKey = client.operatorPublicKey;
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key)
            .setInitialBalance(new Hbar(0))
            .execute(client);

        const receipt = await response.getReceipt(client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        let err = false;

        try {
            await (
                await new TransferTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .addHbarTransfer(account, new Hbar(100))
                    .addHbarTransfer(operatorId, new Hbar(100))
                    .execute(client)
            ).getReceipt(client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidAccountAmounts);
        }

        if (!err) {
            throw new Error("Crypto transfer did not error.");
        }
    });

    it("should error when receiver and sender are the same accounts", async function () {
        this.timeout(10000);

        const client = await newClient();
        const operatorId = client.operatorAccountId;
        const operatorKey = client.operatorPublicKey;
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key)
            .setInitialBalance(new Hbar(1))
            .execute(client);

        const receipt = await response.getReceipt(client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        let err = false;

        try {
            await (
                await new TransferTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .addHbarTransfer(account, new Hbar(100))
                    .addHbarTransfer(account, new Hbar(-100))
                    .execute(client)
            ).getReceipt(client);
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
