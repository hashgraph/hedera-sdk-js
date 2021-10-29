import AccountCreateTransaction from "../src/account/AccountCreateTransaction.js";
import AccountDeleteTransaction from "../src/account/AccountDeleteTransaction.js";
import AccountRecordsQuery from "../src/account/AccountRecordsQuery.js";
import TransferTransaction from "../src/account/TransferTransaction.js";
import Hbar from "../src/Hbar.js";
import TransactionId from "../../src/transaction/TransactionId.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";
import { PrivateKey } from "../src/index.js";

describe("AccountRecords", function () {
    it("should be executable", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key.publicKey)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        await (
            await new TransferTransaction()
                .addHbarTransfer(account, new Hbar(1))
                .addHbarTransfer(operatorId, new Hbar(1).negated())
                .execute(env.client)
        ).getReceipt(env.client);

        const records = await new AccountRecordsQuery()
            .setAccountId(operatorId)
            .setMaxQueryPayment(new Hbar(1))
            .execute(env.client);

        expect(records.length).to.be.gt(0);

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
});
