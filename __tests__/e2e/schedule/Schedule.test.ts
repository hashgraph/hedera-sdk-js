import {
    AccountCreateTransaction,
    ScheduleCreateTransaction,
    ScheduleInfoQuery,
    ScheduleDeleteTransaction,
    ScheduleSignTransaction,
    Ed25519PrivateKey,
    Hbar
} from "../../../src/index-node";
import * as utf8 from "@stablelib/utf8";
import { getClientForIntegrationTest } from "../client-setup";

describe("ScheduleCreateTransaction", () => {
    it("can be executed", async() => {
        const client = await getClientForIntegrationTest();

        const key = await Ed25519PrivateKey.generate();

        const transaction = new AccountCreateTransaction()
            .setInitialBalance(new Hbar(10))
            .setKey(key.publicKey)
            .build(client);

        const scheduled = transaction.schedule()
            .setPayerAccountId(client._getOperatorAccountId()!)
            .setAdminKey(client._getOperatorKey()!);

        const transactionId = await scheduled
            .setMaxTransactionFee(new Hbar(15))
            .execute(client);

        const receipt = await transactionId.getReceipt(client);

        await new Promise((r) => setTimeout(r, 2500));

        const schedule = receipt.getScheduleId();

        const info = await new ScheduleInfoQuery()
            .setScheduleId(schedule)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        console.log(info.executionTime?.toDateString());
    }, 60000);

    it("can be executed with setTransaction", async() => {
        const client = await getClientForIntegrationTest();

        const key = await Ed25519PrivateKey.generate();

        const transaction = new AccountCreateTransaction()
            .setInitialBalance(new Hbar(10))
            .setKey(key.publicKey)
            .build(client);

        const scheduled = new ScheduleCreateTransaction()
            .setScheduledTransaction(transaction)
            .setPayerAccountId(client._getOperatorAccountId()!)
            .setAdminKey(client._getOperatorKey()!);

        const transactionId = await scheduled
            .setMaxTransactionFee(new Hbar(15))
            .execute(client);

        const receipt = await transactionId.getReceipt(client);

        await new Promise((r) => setTimeout(r, 2500));

        const schedule = receipt.getScheduleId();

        const info = await new ScheduleInfoQuery()
            .setScheduleId(schedule)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);
        console.log(info.getTransaction().toString());
        console.log(info.executionTime?.toDateString());
    }, 60000);
});
