import AccountCreateTransaction from "../src/account/AccountCreateTransaction.js";
import AccountDeleteTransaction from "../src/account/AccountDeleteTransaction.js";
import AccountUpdateTransaction from "../src/account/AccountUpdateTransaction.js";
import AccountInfoQuery from "../src/account/AccountInfoQuery.js";
import Hbar from "../src/Hbar.js";
import TransactionId from "../../src/transaction/TransactionId.js";
import newClient from "./client/index.js";
import { PrivateKey } from "../src/index.js";

describe("AccountUpdate", function () {
    it("should be executable", async function () {
        this.timeout(15000);

        const client = await newClient();
        const operatorId = client.operatorAccountId;

        const key1 = PrivateKey.generate();
        const key2 = PrivateKey.generate();

        let response = await new AccountCreateTransaction()
            .setKey(key1.publicKey)
            .setMaxTransactionFee(new Hbar(2))
            .setInitialBalance(new Hbar(1))
            .execute(client);

        const receipt = await response.getReceipt(client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        let info = await new AccountInfoQuery()
            .setNodeAccountIds([response.nodeId])
            .setAccountId(account)
            .execute(client);

        expect(info.accountId.toString()).to.be.equal(account.toString());
        expect(info.isDeleted).to.be.false;
        expect(info.key.toString()).to.be.equal(key1.publicKey.toString());
        expect(info.balance.toTinybars().toInt()).to.be.equal(
            new Hbar(1).toTinybars().toInt()
        );
        expect(info.autoRenewPeriod.seconds.toNumber()).to.be.equal(7776000);
        expect(info.proxyAccountId).to.be.null;
        expect(info.proxyReceived.toTinybars().toInt()).to.be.equal(0);

        response = await (
            await (
                await new AccountUpdateTransaction()
                    .setNodeAccountIds([response.nodeId])
                    .setAccountId(account)
                    .setMaxTransactionFee(new Hbar(1))
                    .setKey(key2.publicKey)
                    .setMaxTransactionFee(new Hbar(1))
                    .freezeWith(client)
                    .sign(key1)
            ).sign(key2)
        ).execute(client);

        await response.getReceipt(client);

        info = await new AccountInfoQuery()
            .setNodeAccountIds([response.nodeId])
            .setAccountId(account)
            .execute(client);

        expect(info.accountId.toString()).to.be.equal(account.toString());
        expect(info.isDeleted).to.be.false;
        expect(info.key.toString()).to.be.equal(key2.publicKey.toString());
        expect(info.balance.toTinybars().toInt()).to.be.equal(
            new Hbar(1).toTinybars().toInt()
        );
        expect(info.autoRenewPeriod.seconds.toNumber()).to.be.equal(7776000);
        expect(info.proxyAccountId).to.be.null;
        expect(info.proxyReceived.toTinybars().toInt()).to.be.equal(0);

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setMaxTransactionFee(new Hbar(1))
                    .setNodeAccountIds([response.nodeId])
                    .setTransferAccountId(operatorId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(client)
                    .sign(key2)
            ).execute(client)
        ).getReceipt(client);
    });
});
