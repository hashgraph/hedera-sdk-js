import AccountCreateTransaction from "../src/account/AccountCreateTransaction";
import AccountDeleteTransaction from "../src/account/AccountDeleteTransaction";
import AccountInfoQuery from "../src/account/AccountInfoQuery";
import TransactionReceiptQuery from "../src/TransactionReceiptQuery";
import Hbar from "../src/Hbar";
import TransactionId from "../src/TransactionId";
import newClient from "./IntegrationClient";
import PrivateKey from "../../packages/cryptography/src/PrivateKey";
import Long from "long";
import { AccountRecordsQuery, AccountStakersQuery } from "../../lib";
import HederaPreCheckStatusError from "../src/HederaPreCheckStatusError";

describe("AccountIntegration", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const client = newClient();
        const operatorId = client.getOperatorId();

        const key1 = PrivateKey.generate();
        const key2 = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
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

        expect(balance).to.be.equal(new Hbar(1));

        const info = await new AccountInfoQuery()
            .setNodeId(response.nodeId)
            .setAccountId(account)
            .execute(client);

        expect(info.accountId).to.be.equal(account);
        expect(info.isDeleted).to.be.false;
        expect(info.key.toString()).to.be.equal(key.getPublicKey().toString());
        expect(info.balance).to.be.equal(new Hbar(1));
        expect(info.autoRenewPeriod.toInt()).to.be.equal(Long.fromInt(90));
        expect(info.receiveRecordThreshold.toTinybars().toInt()).to.be.equal(
            Long.MAX_VALUE.toInt()
        );
        expect(info.sendRecordThreshold.toTinybars().toInt()).to.be.equal(
            Long.MAX_VALUE.toInt()
        );
        expect(info.proxyAccountID).to.be.null;
        expect(info.proxyReceived).to.be.equal(
            new Hbar.fromTinybars(Long.ZERO.toInt())
        );

        await new AccountRecordsQuery()
            .setNodeId(response.nodeId)
            .setAccountId(account)
            .setMaxQueryPayment(new Hbar(1))
            .execute(client);

        expect(
            await new AccountStakersQuery()
                .setNodeId(response.nodeId)
                .setAccountId(account)
                .setMaxQueryPayment(new Hbar(1))
                .execute(client)
        ).to.throw(HederaPreCheckStatusError.class);

        await (
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

        expect(balance).to.be.equal(new Hbar(1));

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

        expect(
            await new AccountStakersQuery()
                .setNodeId(response.nodeId)
                .setAccountId(account)
                .execute(client)
        ).to.throw(HederaPreCheckStatusError.class);

        await id.getReceipt(client);
    });
});
