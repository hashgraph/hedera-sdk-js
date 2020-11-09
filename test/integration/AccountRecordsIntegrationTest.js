import AccountCreateTransaction from "../src/account/AccountCreateTransaction.js";
import AccountDeleteTransaction from "../src/account/AccountDeleteTransaction.js";
import AccountRecordsQuery from "../src/account/AccountRecordsQuery.js";
import TransferTransaction from "../src/account/TransferTransaction.js";
import Hbar from "../src/Hbar.js";
import TransactionId from "../../src/transaction/TransactionId.js";
import newClient from "./client/index.js";
import { PrivateKey } from "../src/index.js";

describe("AccountRecords", function () {
    it("should be executable", async function () {
        this.timeout(15000);

        const client = await newClient();
        const operatorId = client.operatorAccountId;
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key.publicKey)
            .setMaxTransactionFee(new Hbar(2))
            .setInitialBalance(new Hbar(1))
            .execute(client);

        const receipt = await response.getReceipt(client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        await new TransferTransaction()
            .setNodeAccountIds([response.nodeId])
            .addHbarTransfer(account, new Hbar(1))
            .addHbarTransfer(operatorId, new Hbar(1).negated())
            .execute(client);

        const records = await new AccountRecordsQuery()
            .setNodeAccountIds([response.nodeId])
            .setAccountId(operatorId)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(records.length).to.be.equal(0);

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setMaxTransactionFee(new Hbar(1))
                    .setNodeAccountIds([response.nodeId])
                    .setTransferAccountId(operatorId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(client)
                    .sign(key)
            ).execute(client)
        ).getReceipt(client);
    });
});
