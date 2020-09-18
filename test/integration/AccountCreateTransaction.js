import AccountCreateTransaction from "../src/account/AccountCreateTransaction";
import AccountDeleteTransaction from "../src/account/AccountDeleteTransaction";
import AccountInfoQuery from "../src/account/AccountInfoQuery";
import TransactionReceiptQuery from "../src/TransactionReceiptQuery";
import Hbar from "../src/Hbar";
import TransactionId from "../src/TransactionId";
import newClient from "./IntegrationClient";
import Long from "long";
import { Client, PrivateKey } from "../src/index";

describe("AccountCreateTransaction", function () {
    it("should be exectuable", async function () {
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
            .setNodeId(response.nodeId)
            .execute(client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        const info = await new AccountInfoQuery()
            .setNodeId(response.nodeId)
            .setAccountId(account)
            .execute(client);

        expect(info.accountId).to.be.equal(account);
        expect(info.deleted).to.be.false;
        expect(info.key.toString()).to.be.equal(key.getPublicKey().toString());
        expect(info.balance.toTinybars()).to.be.equal(new Hbar(1).toTinybars());
        expect(info.autoRenewPeriod).to.be.equal(Long.fromValue(7776000));
        expect(info.receiveRecordThreshold.toTinybars()).to.be.equal(
            Long.MAX_VALUE
        );
        expect(info.sendRecordThreshold.toTinybars()).to.be.equal(
            Long.MAX_VALUE
        );
        expect(info.proxyAccountId).to.be.null;
        expect(info.proxyReceived.toTinybars()).to.be.equal(
            new Hbar(0).toTinybars()
        );

        // await (
        //     await (
        //         await new AccountDeleteTransaction()
        //             .setAccountId(account)
        //             .setNodeId(response.nodeId)
        //             .setTransferAccountId(operatorId)
        //             .setTransactionId(TransactionId.generate(account))
        //             .freezeWith(client)
        //             .sign(key)
        //     ).execute(client)
        // ).transactionId.getReceipt(client);
    });
});
