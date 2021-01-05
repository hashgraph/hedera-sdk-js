import AccountCreateTransaction from "../src/account/AccountCreateTransaction.js";
import AccountDeleteTransaction from "../src/account/AccountDeleteTransaction.js";
import AccountUpdateTransaction from "../src/account/AccountUpdateTransaction.js";
import AccountInfoQuery from "../src/account/AccountInfoQuery.js";
import Hbar from "../src/Hbar.js";
import Timestamp from "../src/Timestamp.js";
import Status from "../src/Status.js";
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
            .setInitialBalance(new Hbar(2))
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
            new Hbar(2).toTinybars().toInt()
        );
        expect(info.autoRenewPeriod.seconds.toNumber()).to.be.equal(7776000);
        expect(info.proxyAccountId).to.be.null;
        expect(info.proxyReceived.toTinybars().toInt()).to.be.equal(0);

        response = await (
            await (
                await new AccountUpdateTransaction()
                    .setAccountId(account)
                    .setKey(key2.publicKey)
                    // .setAutoRenewPeriod(777600000)
                    // .setExpirationTime(new Date(Date.now() + 7776000000))
                    .setNodeAccountIds([response.nodeId])
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
            new Hbar(2).toTinybars().toInt()
        );
        expect(info.autoRenewPeriod.seconds.toNumber()).to.be.equal(7776000);
        expect(info.proxyAccountId).to.be.null;
        expect(info.proxyReceived.toTinybars().toInt()).to.be.equal(0);

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setNodeAccountIds([response.nodeId])
                    .setTransferAccountId(operatorId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(client)
                    .sign(key2)
            ).execute(client)
        ).getReceipt(client);
    });

    it("should error with invalid auto renew period", async function () {
        this.timeout(15000);

        const client = await newClient();

        const key1 = PrivateKey.generate();
        const key2 = PrivateKey.generate();

        let response = await new AccountCreateTransaction()
            .setKey(key1.publicKey)
            .setInitialBalance(new Hbar(2))
            .execute(client);

        const receipt = await response.getReceipt(client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        let err = false;

        try {
            await (
                await (
                    await (
                        await new AccountUpdateTransaction()
                            .setAccountId(account)
                            .setKey(key2.publicKey)
                            .setAutoRenewPeriod(777600000)
                            .setNodeAccountIds([response.nodeId])
                            .freezeWith(client)
                            .sign(key1)
                    ).sign(key2)
                ).execute(client)
            ).getReceipt(client);
        } catch (error) {
            err = error
                .toString()
                .includes(Status.AutorenewDurationNotInRange.toString());
        }

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setNodeAccountIds([response.nodeId])
                    .setTransferAccountId(client.operatorAccountId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(client)
                    .sign(key1)
            ).execute(client)
        ).getReceipt(client);

        if (!err) {
            throw new Error("account update did not error");
        }
    });

    it("should error with insufficent tx fee when a large expiration time is set", async function () {
        this.timeout(15000);

        const client = await newClient();

        const key1 = PrivateKey.generate();
        const key2 = PrivateKey.generate();

        let response = await new AccountCreateTransaction()
            .setKey(key1.publicKey)
            .setInitialBalance(new Hbar(2))
            .execute(client);

        const receipt = await response.getReceipt(client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        let err = false;

        try {
            await (
                await (
                    await (
                        await new AccountUpdateTransaction()
                            .setAccountId(account)
                            .setKey(key2.publicKey)
                            .setExpirationTime(
                                new Timestamp(Date.now() + 77760000000, 0)
                            )
                            .setNodeAccountIds([response.nodeId])
                            .freezeWith(client)
                            .sign(key1)
                    ).sign(key2)
                ).execute(client)
            ).getReceipt(client);
        } catch (error) {
            err = error
                .toString()
                .includes(Status.InsufficientTxFee.toString());
        }

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setNodeAccountIds([response.nodeId])
                    .setTransferAccountId(client.operatorAccountId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(client)
                    .sign(key1)
            ).execute(client)
        ).getReceipt(client);

        if (!err) {
            throw new Error("account update did not error");
        }
    });

    it("should error when account ID is not set", async function () {
        this.timeout(15000);

        const client = await newClient();

        let err = false;

        try {
            await (
                await new AccountUpdateTransaction()
                    .setKey(client.operatorPublicKey)
                    .execute(client)
            ).getReceipt(client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidAccountId.toString());
        }

        if (!err) {
            throw new Error("account update did not error");
        }
    });

    it("should execute with only account ID", async function () {
        this.timeout(15000);

        const client = await newClient();

        const key1 = PrivateKey.generate();

        let response = await new AccountCreateTransaction()
            .setKey(key1.publicKey)
            .setInitialBalance(new Hbar(2))
            .execute(client);

        const receipt = await response.getReceipt(client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        await (
            await (
                await new AccountUpdateTransaction()
                    .setAccountId(account)
                    .setNodeAccountIds([response.nodeId])
                    .freezeWith(client)
                    .sign(key1)
            ).execute(client)
        ).getReceipt(client);

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setNodeAccountIds([response.nodeId])
                    .setTransferAccountId(client.operatorAccountId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(client)
                    .sign(key1)
            ).execute(client)
        ).getReceipt(client);
    });

    it("should error with invalid signature", async function () {
        this.timeout(15000);

        const client = await newClient();

        const key1 = PrivateKey.generate();
        const key2 = PrivateKey.generate();

        let response = await new AccountCreateTransaction()
            .setKey(key1.publicKey)
            .setInitialBalance(new Hbar(2))
            .execute(client);

        const receipt = await response.getReceipt(client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        let err = false;

        try {
            await (
                await (
                    await new AccountUpdateTransaction()
                        .setAccountId(account)
                        .setKey(key2.publicKey)
                        .setNodeAccountIds([response.nodeId])
                        .freezeWith(client)
                        .sign(key1)
                ).execute(client)
            ).getReceipt(client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidSignature.toString());
        }

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setNodeAccountIds([response.nodeId])
                    .setTransferAccountId(client.operatorAccountId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(client)
                    .sign(key1)
            ).execute(client)
        ).getReceipt(client);

        if (!err) {
            throw new Error("account update did not error");
        }
    });
});
