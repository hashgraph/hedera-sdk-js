import {
    AccountCreateTransaction,
    AccountDeleteTransaction,
    AccountId,
    FileCreateTransaction,
    Hbar,
    PrivateKey,
    TokenCreateTransaction,
    TransferTransaction,
    TransactionReceipt,
    TransactionResponse,
    Transaction,
} from "../../src/exports.js";
import * as hex from "../../src/encoding/hex.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("TransactionIntegration", function () {
    it("should be executable", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        expect(operatorId).to.not.be.null;

        const key = PrivateKey.generateED25519();

        const transaction = await new AccountCreateTransaction()
            .setKey(key.publicKey)
            .freezeWith(env.client)
            .signWithOperator(env.client);

        const expectedHash = await transaction.getTransactionHash();

        const response = await transaction.execute(env.client);

        const record = await response.getRecord(env.client);

        expect(hex.encode(expectedHash)).to.be.equal(
            hex.encode(record.transactionHash),
        );

        const account = record.receipt.accountId;
        expect(account).to.not.be.null;

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setTransferAccountId(operatorId)
                    .freezeWith(env.client)
                    .sign(key)
            ).execute(env.client)
        ).getReceipt(env.client);

        await env.close();
    });

    it("signs on demand", async function () {
        this.timeout(10000);

        const env = await IntegrationTestEnv.new();
        env.client.setSignOnDemand(true);

        const fileId = (
            await (
                await new FileCreateTransaction()
                    .setContents("test")
                    .execute(env.client)
            ).getReceipt(env.client)
        ).fileId;

        expect(fileId.num).to.not.be.equal(0);

        await env.close();
    });

    it("signs correctly", async function () {
        this.timeout(10000);

        const env = await IntegrationTestEnv.new();
        const key = PrivateKey.generateED25519();

        let transaction = await (
            await new TokenCreateTransaction()
                .setAdminKey(key.publicKey)
                .freezeWith(env.client)
                .sign(key)
        ).signWithOperator(env.client);

        expect(
            transaction._signedTransactions.list[0].sigMap.sigPair.length,
        ).to.eql(2);

        transaction = await (
            await new TokenCreateTransaction()
                .setAdminKey(key.publicKey)
                .freezeWith(env.client)
                .signWithOperator(env.client)
        ).sign(key);

        expect(
            transaction._signedTransactions.list[0].sigMap.sigPair.length,
        ).to.eql(2);

        await env.close();
    });

    it("issue-327", async function () {
        this.timeout(30000);
        const env = await IntegrationTestEnv.new();
        const privateKey1 = PrivateKey.generateED25519();
        const privateKey2 = PrivateKey.generateED25519();
        const privateKey3 = PrivateKey.generateED25519();
        const privateKey4 = PrivateKey.generateED25519();
        const publicKey1 = privateKey1.publicKey;
        const publicKey2 = privateKey2.publicKey;
        const publicKey3 = privateKey3.publicKey;
        const publicKey4 = privateKey4.publicKey;

        const nodeAccountId = Object.values(env.client.network)[0];

        const transaction = new TransferTransaction()
            .setNodeAccountIds([nodeAccountId])
            .addHbarTransfer(
                env.client.operatorAccountId,
                new Hbar(1).negated(),
            )
            .addHbarTransfer(new AccountId(3), new Hbar(1))
            .freezeWith(env.client);

        const signature1 = privateKey1.signTransaction(transaction);
        const signature2 = privateKey2.signTransaction(transaction);
        const signature3 = privateKey3.signTransaction(transaction);

        transaction
            .addSignature(publicKey1, signature1)
            .addSignature(publicKey2, signature2)
            .addSignature(publicKey3, signature3);

        const signatures = transaction.getSignatures();

        const nodeSignatures = signatures.get(nodeAccountId);

        const publicKey1Signature = nodeSignatures.get(publicKey1);
        const publicKey2Signature = nodeSignatures.get(publicKey2);
        const publicKey3Signature = nodeSignatures.get(publicKey3);
        const publicKey4Signature = nodeSignatures.get(publicKey4);

        expect(publicKey1Signature).to.be.not.null;
        expect(publicKey2Signature).to.be.not.null;
        expect(publicKey3Signature).to.be.not.null;
        expect(publicKey4Signature).to.be.null;

        await env.close();
    });

    it("[HIP-745] should serialize and deserialize an incomplete transaction and execute it", async function () {
        this.timeout(120000);
        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;

        // Generate a new account
        const recipientPrivateKey = PrivateKey.generateECDSA();

        // Create account transaction
        const accountCreateTx = await new AccountCreateTransaction()
            .setKey(recipientPrivateKey.publicKey)
            .setInitialBalance(new Hbar(2))
            .freezeWith(env.client)
            .execute(env.client);

        // Get a receipt for create account transaction
        const accountCreateTxReceipt = await accountCreateTx.getReceipt(
            env.client,
        );
        expect(accountCreateTxReceipt).to.not.equal(null);
        expect(accountCreateTxReceipt).to.be.an.instanceof(TransactionReceipt);
        expect(accountCreateTxReceipt.status._code).to.be.equal(22);

        // Get an account id and make sure the account id exists
        const recepinetAccountId = accountCreateTxReceipt.accountId.toString();
        expect(recepinetAccountId).to.not.equal(undefined);

        // Create transfer transaction
        const transaction = new TransferTransaction()
            .addHbarTransfer(operatorId, new Hbar(-1))
            .addHbarTransfer(recepinetAccountId, new Hbar(1));

        // Serialize transaction into bytes
        const transactionBytes = transaction.toBytes();

        // Deserialize transaction from bytes
        const transactionFromBytes = TransferTransaction.fromBytes(
            transactionBytes,
        ).freezeWith(env.client);

        expect(hex.encode(transactionBytes)).to.be.equal(
            hex.encode(transactionFromBytes.toBytes()),
        );

        // Sign transaction
        const signedTransaction =
            await transactionFromBytes.sign(recipientPrivateKey);

        // Execute transaction
        const transactionResponse = await signedTransaction.execute(env.client);
        expect(transactionResponse).to.not.equal(null);
        expect(transactionResponse).to.be.an.instanceof(TransactionResponse);

        // Get a receipt and make sure the transaction was executed successfully
        const executedTransactionReceipt = await transactionResponse.getReceipt(
            env.client,
        );
        expect(executedTransactionReceipt).to.not.equal(null);
        expect(executedTransactionReceipt).to.be.an.instanceof(
            TransactionReceipt,
        );
        expect(executedTransactionReceipt.status._code).to.be.equal(22);

        await env.close();
    });

    it("[HIP-745] should serialize and deserialize a signed transaction and execute it", async function () {
        this.timeout(120000);
        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;

        // Generate a new account
        const recipientPrivateKey = PrivateKey.generateECDSA();

        // Create account transaction
        const accountCreateTx = await new AccountCreateTransaction()
            .setKey(recipientPrivateKey.publicKey)
            .setInitialBalance(new Hbar(2))
            .freezeWith(env.client)
            .execute(env.client);

        // Get a receipt for create account transaction
        const accountCreateTxReceipt = await accountCreateTx.getReceipt(
            env.client,
        );
        expect(accountCreateTxReceipt).to.not.equal(null);
        expect(accountCreateTxReceipt).to.be.an.instanceof(TransactionReceipt);
        expect(accountCreateTxReceipt.status._code).to.be.equal(22);

        // Get an account id and make sure the account id exists
        const recepinetAccountId = accountCreateTxReceipt.accountId.toString();

        expect(recepinetAccountId).to.not.equal(undefined);

        // Create transfer transaction
        const transaction = new TransferTransaction()
            .addHbarTransfer(operatorId, new Hbar(-1))
            .addHbarTransfer(recepinetAccountId, new Hbar(1))
            .freezeWith(env.client);

        // Serialize transaction into bytes
        const transactionBytes = transaction.toBytes();

        // Deserialize transaction from bytes
        const transactionFromBytes = Transaction.fromBytes(transactionBytes);

        expect(hex.encode(transactionBytes)).to.be.equal(
            hex.encode(transactionFromBytes.toBytes()),
        );

        // Sign transaction
        const signedTransaction =
            await transactionFromBytes.sign(recipientPrivateKey);

        // Execute transaction
        const transactionResponse = await signedTransaction.execute(env.client);
        expect(transactionResponse).to.not.equal(null);
        expect(transactionResponse).to.be.an.instanceof(TransactionResponse);

        // Get a receipt and make sure the transaction was executed successfully
        const executedTransactionReceipt = await transactionResponse.getReceipt(
            env.client,
        );
        expect(executedTransactionReceipt).to.not.equal(null);
        expect(executedTransactionReceipt).to.be.an.instanceof(
            TransactionReceipt,
        );
        expect(executedTransactionReceipt.status._code).to.be.equal(22);

        await env.close();
    });
});
