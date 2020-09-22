import AccountCreateTransaction from "../src/account/AccountCreateTransaction";
import AccountDeleteTransaction from "../src/account/AccountDeleteTransaction";
import AccountRecordsQuery from "../src/account/AccountRecordsQuery";
import CryptoTransferTransaction from "../src/account/CryptoTransferTransaction";
import TransactionReceiptQuery from "../src/TransactionReceiptQuery";
import Hbar from "../src/Hbar";
import TransactionId from "../src/TransactionId";
import newClient from "./IntegrationClient";
import { PrivateKey } from "../src/index";

describe("AccountRecords", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const client = newClient();
        const operatorId = client.getOperatorId();
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key.getPublicKey())
            .setMaxTransactionFee(new Hbar(2))
            .setInitialBalance(new Hbar(1))
            .execute(client);

        const receipt = await new TransactionReceiptQuery()
            .setNodeId(response.nodeId)
            .setTransactionId(response.transactionId)
            .execute(client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        await new CryptoTransferTransaction()
            .setNodeId(response.nodeId)
            .addRecipient(account, new Hbar(1))
            .addSender(operatorId, new Hbar(1))
            .execute(client);

        const records = await new AccountRecordsQuery()
            .setNodeId(response.nodeId)
            .setAccountId(operatorId)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(records.length).to.be.equal(0);

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setNodeId(response.nodeId)
                    .setTransferAccountId(operatorId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(client)
                    .sign(key)
            ).execute(client)
        ).getReceipt(client);
    });
});
