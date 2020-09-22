import AccountCreateTransaction from "../src/account/AccountCreateTransaction";
import AccountDeleteTransaction from "../src/account/AccountDeleteTransaction";
import AccountUpdateTransaction from "../src/account/AccountUpdateTransaction";
import AccountInfoQuery from "../src/account/AccountInfoQuery";
import Hbar from "../src/Hbar";
import TransactionId from "../src/TransactionId";
import newClient from "./IntegrationClient";
import { PrivateKey } from "../src/index";
import Long from "long";

describe("AccountUpdate", function () {
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

        const receipt = await response.getReceipt(client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        let info = await new AccountInfoQuery()
            .setNodeId(response.nodeId)
            .setAccountId(account)
            .execute(client);

        expect(info.accountId.toString()).to.be.equal(account.toString());
        expect(info.isDeleted).to.be.false;
        expect(info.key.toString()).to.be.equal(key1.getPublicKey().toString());
        expect(info.balance.toTinybars().toInt()).to.be.equal(
            new Hbar(1).toTinybars().toInt()
        );
        expect(info.autoRenewPeriod.toInt()).to.be.equal(7776000);
        expect(info.receiveRecordThreshold.toTinybars().toInt()).to.be.equal(
            Long.MAX_VALUE.toInt()
        );
        expect(info.sendRecordThreshold.toTinybars().toInt()).to.be.equal(
            Long.MAX_VALUE.toInt()
        );
        expect(info.proxyAccountId).to.be.null;
        expect(info.proxyReceived.toTinybars().toInt()).to.be.equal(0);

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

        await response.getReceipt(client);

        info = await new AccountInfoQuery()
            .setNodeId(response.nodeId)
            .setAccountId(account)
            .execute(client);

        expect(info.accountId.toString()).to.be.equal(account.toString());
        expect(info.isDeleted).to.be.false;
        expect(info.key.toString()).to.be.equal(key2.getPublicKey().toString());
        expect(info.balance.toTinybars().toInt()).to.be.equal(
            new Hbar(1).toTinybars().toInt()
        );
        expect(info.autoRenewPeriod.toInt()).to.be.equal(7776000);
        expect(info.receiveRecordThreshold.toTinybars().toInt()).to.be.equal(
            Long.MAX_VALUE.toInt()
        );
        expect(info.sendRecordThreshold.toTinybars().toInt()).to.be.equal(
            Long.MAX_VALUE.toInt()
        );
        expect(info.proxyAccountId).to.be.null;
        expect(info.proxyReceived.toTinybars().toInt()).to.be.equal(0);

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setNodeId(response.nodeId)
                    .setTransferAccountId(operatorId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(client)
                    .sign(key2)
            ).execute(client)
        ).getReceipt(client);
    });
});
