import {
    AccountCreateTransaction,
    AccountDeleteTransaction,
    TransferTransaction,
    AccountInfoQuery,
    Hbar,
    PrivateKey,
    Status,
    TransactionId,
    KeyList,
} from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("AccountCreate", function () {
    let env;

    before(async function () {
        env = await IntegrationTestEnv.new();
    });

    it("should be executable", async function () {
        this.timeout(120000);

        const operatorId = env.operatorId;
        const key = PrivateKey.generateED25519();

        const response = await new AccountCreateTransaction()
            .setKey(key.publicKey)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        const info = await new AccountInfoQuery()
            .setAccountId(account)
            .execute(env.client);

        expect(info.accountId.toString()).to.be.equal(account.toString());
        expect(info.isDeleted).to.be.false;
        expect(info.key.toString()).to.be.equal(key.publicKey.toString());
        expect(info.balance.toTinybars().toNumber()).to.be.equal(
            new Hbar(2).toTinybars().toNumber()
        );
        expect(info.autoRenewPeriod.seconds.toNumber()).to.be.equal(7776000);
        expect(info.proxyAccountId).to.be.null;
        expect(info.proxyReceived.toTinybars().toNumber()).to.be.equal(0);

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setTransferAccountId(operatorId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(env.client)
                    .sign(key)
            ).execute(env.client)
        ).getReceipt(env.client);
    });

    it("should be able to create an account with an ECDSA private key", async function () {
        this.timeout(120000);

        const key = PrivateKey.generateECDSA();

        const response = await new AccountCreateTransaction()
            .setKey(key.publicKey)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        const info = await new AccountInfoQuery()
            .setNodeAccountIds([response.nodeId])
            .setAccountId(account)
            .execute(env.client);

        expect(info.accountId.toString()).to.be.equal(account.toString());
        expect(info.isDeleted).to.be.false;
        expect(info.key.toString()).to.be.equal(key.publicKey.toString());
        expect(info.balance.toTinybars().toNumber()).to.be.equal(
            new Hbar(2).toTinybars().toNumber()
        );
        expect(info.autoRenewPeriod.seconds.toNumber()).to.be.equal(7776000);
        expect(info.proxyAccountId).to.be.null;
        expect(info.proxyReceived.toTinybars().toNumber()).to.be.equal(0);

        const transaction = new TransferTransaction()
            .setNodeAccountIds([response.nodeId])
            .setTransactionId(TransactionId.generate(account))
            .addHbarTransfer(account, Hbar.fromTinybars(10).negated())
            .addHbarTransfer(env.operatorId, Hbar.fromTinybars(10))
            .freezeWith(env.client);

        await transaction.sign(key);
        await transaction.execute(env.client);
    });

    it("should be executable with only key set", async function () {
        this.timeout(15000);

        const operatorId = env.operatorId;
        const key = PrivateKey.generateED25519();

        const response = await new AccountCreateTransaction()
            .setKey(key.publicKey)
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        const info = await new AccountInfoQuery()
            .setAccountId(account)
            .execute(env.client);

        expect(info.accountId.toString()).to.be.equal(account.toString());
        expect(info.isDeleted).to.be.false;
        expect(info.key.toString()).to.be.equal(key.publicKey.toString());
        expect(info.balance.toTinybars().toNumber()).to.be.equal(0);
        expect(info.autoRenewPeriod.seconds.toNumber()).to.be.equal(7776000);
        expect(info.proxyAccountId).to.be.null;
        expect(info.proxyReceived.toTinybars().toNumber()).to.be.equal(0);

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setTransferAccountId(operatorId)
                    .freezeWith(env.client)
                    .sign(key)
            ).execute(env.client)
        ).getReceipt(env.client);
    });

    it("should error when key is not set", async function () {
        this.timeout(15000);

        let err = false;

        try {
            const response = await new AccountCreateTransaction()
                .setInitialBalance(new Hbar(2))
                .execute(env.client);

            await response.getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.KeyRequired.toString());
        }

        if (!err) {
            throw new Error("account creation did not error");
        }
    });

    it("should be able to sign transaction and verify transaction signtatures", async function () {
        this.timeout(15000);

        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;
        const key = PrivateKey.generateED25519();

        const response = await new AccountCreateTransaction()
            .setKey(key.publicKey)
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        const info = await new AccountInfoQuery()
            .setNodeAccountIds([response.nodeId])
            .setAccountId(account)
            .execute(env.client);

        expect(info.accountId.toString()).to.be.equal(account.toString());
        expect(info.isDeleted).to.be.false;
        expect(info.key.toString()).to.be.equal(key.publicKey.toString());
        expect(info.balance.toTinybars().toNumber()).to.be.equal(0);
        expect(info.autoRenewPeriod.seconds.toNumber()).to.be.equal(7776000);
        expect(info.proxyAccountId).to.be.null;
        expect(info.proxyReceived.toTinybars().toNumber()).to.be.equal(0);

        const transaction = new AccountDeleteTransaction()
            .setNodeAccountIds([response.nodeId])
            .setAccountId(account)
            .setTransferAccountId(operatorId)
            .freezeWith(env.client);

        key.signTransaction(transaction);

        expect(key.publicKey.verifyTransaction(transaction)).to.be.true;
        expect(operatorKey.verifyTransaction(transaction)).to.be.false;

        await (await transaction.execute(env.client)).getReceipt(env.client);
    });

    it("should create account with a single key passed to `KeyList`", async function () {
        const publicKey = PrivateKey.generateED25519().publicKey;
        const thresholdKey = new KeyList(publicKey, 1);

        let transaction = new AccountCreateTransaction()
            .setKey(thresholdKey)
            .setInitialBalance(Hbar.fromTinybars(1))
            .freezeWith(env.client);

        const txAccountCreate = await transaction.execute(env.client);
        const txAccountCreateReceipt = await txAccountCreate.getReceipt(
            env.client
        );
        const accountId = txAccountCreateReceipt.accountId;

        expect(accountId).to.not.be.null;

        const info = await new AccountInfoQuery()
            .setNodeAccountIds([txAccountCreate.nodeId])
            .setAccountId(accountId)
            .execute(env.client);

        expect(info.accountId.toString()).to.be.equal(accountId.toString());
        expect(info.key.toArray()[0].toString()).to.be.equal(
            publicKey.toString()
        );
    });

    it("should create account with alias from admin key", async function () {
        this.timeout(10000);

        // Tests the third row of this table
        // https://github.com/hashgraph/hedera-improvement-proposal/blob/d39f740021d7da592524cffeaf1d749803798e9a/HIP/hip-583.md#signatures

        const adminKey = PrivateKey.generateECDSA();
        const evmAddress = adminKey.publicKey.toEvmAddress();

        // create an admin account
        await new AccountCreateTransaction()
            .setKey(adminKey)
            .execute(env.client);

        let receipt = await (
            await new AccountCreateTransaction()
                .setKey(adminKey)
                .setAlias(evmAddress)
                .freezeWith(env.client)
                .execute(env.client)
        ).getReceipt(env.client);

        const accountId = receipt.accountId;

        expect(accountId).to.not.be.null;

        const info = await new AccountInfoQuery()
            .setAccountId(accountId)
            .execute(env.client);

        expect(info.accountId.toString()).to.not.be.null;
        expect(info.contractAccountId.toString()).to.be.equal(
            evmAddress.toString()
        );
        expect(info.key.toString()).to.be.equal(adminKey.publicKey.toString());
    });

    it("should create account with alias from admin key with receiver sig required", async function () {
        this.timeout(10000);

        // Tests the fourth row of this table
        // https://github.com/hashgraph/hedera-improvement-proposal/blob/d39f740021d7da592524cffeaf1d749803798e9a/HIP/hip-583.md#signatures

        const adminKey = PrivateKey.generateECDSA();
        const evmAddress = adminKey.publicKey.toEvmAddress();

        // create an admin account
        await new AccountCreateTransaction()
            .setKey(adminKey)
            .freezeWith(env.client)
            .execute(env.client);

        let receipt = await (
            await (
                await new AccountCreateTransaction()
                    .setReceiverSignatureRequired(true)
                    .setKey(adminKey)
                    .setAlias(evmAddress)
                    .freezeWith(env.client)
                    .sign(adminKey)
            ).execute(env.client)
        ).getReceipt(env.client);

        const accountId = receipt.accountId;

        expect(accountId).to.not.be.null;

        const info = await new AccountInfoQuery()
            .setAccountId(accountId)
            .execute(env.client);

        expect(info.accountId.toString()).to.not.be.null;
        expect(info.contractAccountId.toString()).to.be.equal(
            evmAddress.toString()
        );
        expect(info.key.toString()).to.be.equal(adminKey.publicKey.toString());
    });

    it("should error when trying to create account with alias from admin key with receiver sig required without signature", async function () {
        this.timeout(10000);

        const adminKey = PrivateKey.generateECDSA();
        const evmAddress = adminKey.publicKey.toEvmAddress();

        // create an admin account
        await new AccountCreateTransaction()
            .setKey(adminKey)
            .freezeWith(env.client)
            .execute(env.client);

        let err = false;
        try {
            await (
                await new AccountCreateTransaction()
                    .setReceiverSignatureRequired(true)
                    .setKey(adminKey)
                    .setAlias(evmAddress)
                    .freezeWith(env.client)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidSignature.toString());
        }

        if (!err) {
            throw new Error("account creation did not error");
        }
    });

    it("should create account with alias different from admin key", async function () {
        this.timeout(10000);

        // Tests the fifth row of this table
        // https://github.com/hashgraph/hedera-improvement-proposal/blob/d39f740021d7da592524cffeaf1d749803798e9a/HIP/hip-583.md#signatures

        const adminKey = PrivateKey.generateED25519();

        // create an admin account
        await new AccountCreateTransaction()
            .setKey(adminKey)
            .freezeWith(env.client)
            .execute(env.client);

        const key = PrivateKey.generateECDSA();
        const evmAddress = key.publicKey.toEvmAddress();

        let receipt = await (
            await (
                await new AccountCreateTransaction()
                    .setKey(adminKey)
                    .setAlias(evmAddress)
                    .freezeWith(env.client)
                    .sign(key)
            ).execute(env.client)
        ).getReceipt(env.client);

        const accountId = receipt.accountId;

        expect(accountId).to.not.be.null;

        const info = await new AccountInfoQuery()
            .setAccountId(accountId)
            .execute(env.client);

        expect(info.accountId.toString()).to.not.be.null;
        expect(info.contractAccountId.toString()).to.be.equal(
            evmAddress.toString()
        );
        expect(info.key.toString()).to.be.equal(adminKey.publicKey.toString());
    });

    it("should error when trying to create account with alias different from admin key without signature", async function () {
        this.timeout(10000);

        const adminKey = PrivateKey.generateED25519();

        // create an admin account
        await new AccountCreateTransaction()
            .setKey(adminKey)
            .freezeWith(env.client)
            .execute(env.client);

        const key = PrivateKey.generateECDSA();
        const evmAddress = key.publicKey.toEvmAddress();

        let err = false;
        try {
            await (
                await new AccountCreateTransaction()
                    .setReceiverSignatureRequired(true)
                    .setKey(adminKey)
                    .setAlias(evmAddress)
                    .freezeWith(env.client)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidSignature.toString());
        }

        if (!err) {
            throw new Error("account creation did not error");
        }
    });

    it("should create account with alias different from admin key with receiver sig required", async function () {
        this.timeout(10000);

        // Tests the sixth row of this table
        // https://github.com/hashgraph/hedera-improvement-proposal/blob/d39f740021d7da592524cffeaf1d749803798e9a/HIP/hip-583.md#signatures

        const adminKey = PrivateKey.generateED25519();

        // create an admin account
        await new AccountCreateTransaction()
            .setKey(adminKey)
            .freezeWith(env.client)
            .execute(env.client);

        const key = PrivateKey.generateECDSA();
        const evmAddress = key.publicKey.toEvmAddress();

        let receipt = await (
            await (
                await (
                    await new AccountCreateTransaction()
                        .setReceiverSignatureRequired(true)
                        .setKey(adminKey)
                        .setAlias(evmAddress)
                        .freezeWith(env.client)
                        .sign(key)
                ).sign(adminKey)
            ).execute(env.client)
        ).getReceipt(env.client);

        const accountId = receipt.accountId;

        expect(accountId).to.not.be.null;

        const info = await new AccountInfoQuery()
            .setAccountId(accountId)
            .execute(env.client);

        expect(info.accountId.toString()).to.not.be.null;
        expect(info.contractAccountId.toString()).to.be.equal(
            evmAddress.toString()
        );
        expect(info.key.toString()).to.be.equal(adminKey.publicKey.toString());
    });

    it("should error when trying to create account with alias different from admin key and receiver sig required without signature", async function () {
        this.timeout(10000);

        const adminKey = PrivateKey.generateED25519();

        // create an admin account
        await new AccountCreateTransaction()
            .setKey(adminKey)
            .freezeWith(env.client)
            .execute(env.client);

        const key = PrivateKey.generateECDSA();
        const evmAddress = key.publicKey.toEvmAddress();

        let err = false;
        try {
            await (
                await (
                    await new AccountCreateTransaction()
                        .setReceiverSignatureRequired(true)
                        .setKey(adminKey)
                        .setAlias(evmAddress)
                        .freezeWith(env.client)
                        .sign(key)
                ).execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidSignature.toString());
        }

        if (!err) {
            throw new Error("account creation did not error");
        }
    });

    after(async function () {
        await env.close();
    });
});
