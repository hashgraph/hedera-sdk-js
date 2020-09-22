import AccountCreateTransaction from "../src/account/AccountCreateTransaction";
import AccountDeleteTransaction from "../src/account/AccountDeleteTransaction";
import AccountUpdateTransaction from "../src/account/AccountUpdateTransaction";
import AccountInfoQuery from "../src/account/AccountInfoQuery";
import AccountBalanceQuery from "../src/account/AccountBalanceQuery";
import AccountStakersQuery from "../src/account/AccountStakersQuery";
import AccountRecordsQuery from "../src/account/AccountRecordsQuery";
import TransactionReceiptQuery from "../src/TransactionReceiptQuery";
import Hbar from "../src/Hbar";
import TransactionId from "../src/TransactionId";
import newClient from "./IntegrationClient";
import Long from "long";
import { PrivateKey } from "../src/index";

describe("AccountIntegration", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const client = newClient();
        const operatorId = client.getOperatorId();

        const key1 = PrivateKey.generate();
        const key2 = PrivateKey.generate();

        let response = await new AccountCreateTransaction()
            .setKey(key1.getPublicKey())
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

        let balance = await new AccountBalanceQuery()
            .setAccountId(account)
            .setNodeId(response.nodeId)
            .execute(client);

        expect(balance.toTinybars().toInt()).to.be.equal(new Hbar(1).toTinybars().toInt());

        const info = await new AccountInfoQuery()
            .setNodeId(response.nodeId)
            .setAccountId(account)
            .execute(client);

        expect(info.accountId.toString()).to.be.equal(account.toString());
        expect(info.isDeleted).to.be.false;
        expect(info.key.toString()).to.be.equal(key1.getPublicKey().toString());
        expect(info.balance.toTinybars().toInt()).to.be.equal(new Hbar(1).toTinybars().toInt());
        expect(info.autoRenewPeriod.toInt()).to.be.equal(7776000);
        expect(info.receiveRecordThreshold.toTinybars().toInt()).to.be.equal(
            Long.MAX_VALUE.toInt()
        );
        expect(info.sendRecordThreshold.toTinybars().toInt()).to.be.equal(
            Long.MAX_VALUE.toInt()
        );
        expect(info.proxyAccountId).to.be.null;
        expect(info.proxyReceived.toTinybars().toInt()).to.be.equal(0);

        await new AccountRecordsQuery()
            .setNodeId(response.nodeId)
            .setAccountId(account)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        let errorThrown = false;

        try {
            await new AccountStakersQuery()
                .setAccountId(operatorId)
                .setMaxQueryPayment(new Hbar(1))
                .execute(client)
        } catch (_) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;

        response = await (
            await (
                await new AccountUpdateTransaction()
                    .setNodeId(response.nodeId)
                    .setAccountId(account)
                    .setKey(key2.getPublicKey())
                    .setMaxTransactionFee(new Hbar(1))
                    .freezeWith(client)
                    .sign(key1)
            ).sign(key2)
        ).execute(client);

        await new TransactionReceiptQuery()
            .setNodeId(response.nodeId)
            .setTransactionId(response.transactionId)
            .execute(client);

        balance = await new AccountBalanceQuery()
            .setAccountId(account)
            .setNodeId(response.nodeId)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(balance.toTinybars().toInt()).to.be.equal(new Hbar(1).toTinybars().toInt());

        const id = (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setNodeId(response.nodeId)
                    .setTransferAccountId(operatorId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(client)
                    .sign(key2)
            ).execute(client)
        ).transactionId;

        errorThrown = false;

        try {
            await new AccountStakersQuery()
                .setAccountId(operatorId)
                .setMaxQueryPayment(new Hbar(1))
                .execute(client)
        } catch (_) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;

        await new TransactionReceiptQuery()
            .setNodeId(response.nodeId)
            .setTransactionId(id)
            .execute(client);
    });
});
