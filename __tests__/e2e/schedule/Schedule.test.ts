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

        let scheduled = transaction.schedule()
            .setPayerAccountId(client._getOperatorAccountId()!)
            .setAdminKey(client._getOperatorKey()!);

        let transactionId = await scheduled
            .setMaxTransactionFee(new Hbar(15))
            .execute(client);

        const receipt = await transactionId.getReceipt(client);

        await new Promise((r) => setTimeout(r, 2500));

        const schedule = receipt.getScheduleId();

        await new ScheduleInfoQuery()
            .setScheduleId(schedule)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        transactionId = await new ScheduleDeleteTransaction()
            .setScheduleId(schedule)
            .setMaxTransactionFee(new Hbar(5))
            .execute(client);

        await transactionId.getReceipt(client);
    }, 60000);
});
