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
    TransactionId,
    Timestamp,
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

    describe("HIP-745 - create incompleted transaction", function () {
        let env, operatorId, operatorKey, recipientKey, recipientId, client, wallet;

        beforeEach(async function () {
            env = await IntegrationTestEnv.new();
            operatorId = env.operatorId;
            operatorKey = env.operatorKey;
            recipientKey = PrivateKey.generateECDSA();
            recipientId = recipientKey.publicKey.toAccountId(0, 0);
            client = env.client;
            wallet = env.wallet;
        });

        afterEach(function () {
            client.close();
        });

        // Example: serialize-deserialize-1
        it("should serialize and deserialize the so-called signed transaction, and execute it", async function () {
            this.timeout(120000);
            try {
                // 1. Create transaction and freeze it
                const transaction = new TransferTransaction()
                    .addHbarTransfer(operatorId, new Hbar(-1))
                    .addHbarTransfer(recipientId, new Hbar(1))
                    .freezeWith(client);

                // 2. Serialize transaction into bytes
                const transactionBytes = transaction.toBytes();

                // 3. Deserialize transaction from bytes
                const transactionFromBytes =
                    Transaction.fromBytes(transactionBytes);

                expect(hex.encode(transactionBytes)).to.be.equal(
                    hex.encode(transactionFromBytes.toBytes()),
                );

                // 4. Sign and execute transaction
                const response = await (
                    await transactionFromBytes.sign(recipientKey)
                ).execute(client);
                expect(response).to.be.instanceof(TransactionResponse);
                expect(
                    transactionFromBytes._nodeAccountIds.isEmpty,
                ).to.be.equal(false);
                expect(
                    transactionFromBytes._transactionIds.isEmpty,
                ).to.be.equal(false);

                // 5. Get a receipt
                const receipt = await response.getReceipt(client);
                expect(receipt).to.be.an.instanceof(TransactionReceipt);
                expect(receipt.status.toString()).to.be.equal("SUCCESS");
            } catch (error) {
                console.log(error);
            }
        });

        // Example: serialize-deserialize-2
        it("should serialize and deserialize the so-called signed transaction after being signed, and execute it", async function () {
            this.timeout(120000);
            try {
                // 1. Create transaction and freeze it
                let transaction = new TransferTransaction()
                    .addHbarTransfer(operatorId, new Hbar(-1))
                    .addHbarTransfer(recipientId, new Hbar(1))
                    .freezeWith(client);

                // 2. Sign transaction
                await transaction.sign(recipientKey);

                // 3. Serialize transaction into bytes
                const transactionBytes = transaction.toBytes();

                // 4. Deserialize transaction from bytes
                const transactionFromBytes =
                    Transaction.fromBytes(transactionBytes);

                expect(hex.encode(transactionBytes)).to.be.equal(
                    hex.encode(transactionFromBytes.toBytes()),
                );
                expect(
                    transactionFromBytes._nodeAccountIds.isEmpty,
                ).to.be.equal(false);
                expect(
                    transactionFromBytes._transactionIds.isEmpty,
                ).to.be.equal(false);

                // 5. Execute transaction
                const response = await transactionFromBytes.execute(client);
                expect(response).to.be.instanceof(TransactionResponse);

                // 6. Get a receipt
                const receipt = await response.getReceipt(client);
                expect(receipt).to.be.an.instanceof(TransactionReceipt);
                expect(receipt.status.toString()).to.be.equal("SUCCESS");
            } catch (error) {
                console.log(error);
            }
        });

        // Example: serialize-deserialize-3
        it("should serialize and deserialize so-called incompleted transaction, and execute it", async function () {
            this.timeout(120000);
            try {
                // 1. Create transaction
                const transaction = new TransferTransaction()
                    .addHbarTransfer(operatorId, new Hbar(-1))
                    .addHbarTransfer(recipientId, new Hbar(1));

                // 2. Serialize transaction into bytes
                const transactionBytes = transaction.toBytes();

                // 3. Deserialize transaction from bytes
                const transactionFromBytes =
                    Transaction.fromBytes(transactionBytes);

                expect(hex.encode(transactionBytes)).to.be.equal(
                    hex.encode(transactionFromBytes.toBytes()),
                );
                expect(
                    transactionFromBytes._nodeAccountIds.isEmpty,
                ).to.be.equal(true);
                expect(
                    transactionFromBytes._transactionIds.isEmpty,
                ).to.be.equal(true);

                // 4. Freeze, sign and execute transaction
                const response = await (
                    await transactionFromBytes
                        .freezeWith(client)
                        .sign(recipientKey)
                ).execute(client);
                expect(response).to.be.instanceof(TransactionResponse);

                // 5. Get a receipt
                const receipt = await response.getReceipt(client);
                expect(receipt).to.be.an.instanceof(TransactionReceipt);
                expect(receipt.status.toString()).to.be.equal("SUCCESS");
            } catch (error) {
                console.log(error);
            }
        });

        // Example: serialize-deserialize-4
        it("should serialize and deserialize so-called incompleted transaction, set node account ids and execute it", async function () {
            this.timeout(120000);
            try {
                // 1. Create transaction
                const transaction = new TransferTransaction()
                    .addHbarTransfer(operatorId, new Hbar(-1))
                    .addHbarTransfer(recipientId, new Hbar(1));

                // 2. Serialize transaction into bytes
                const transactionBytes = transaction.toBytes();

                // 3. Deserialize transaction from bytes
                let transactionFromBytes =
                    Transaction.fromBytes(transactionBytes);

                expect(hex.encode(transactionBytes)).to.be.equal(
                    hex.encode(transactionFromBytes.toBytes()),
                );
                expect(
                    transactionFromBytes._nodeAccountIds.isEmpty,
                ).to.be.equal(true);
                expect(
                    transactionFromBytes._transactionIds.isEmpty,
                ).to.be.equal(true);

                // 4. Set node account ids
                const nodeAccountId = new AccountId(3);
                transactionFromBytes.setNodeAccountIds([nodeAccountId]);

                expect(
                    transactionFromBytes._nodeAccountIds.get(0).toString(),
                ).to.be.equal(nodeAccountId.toString());

                // 5. Freeze, sign and execute transaction
                const response = await (
                    await transactionFromBytes
                        .freezeWith(client)
                        .sign(recipientKey)
                ).execute(client);
                expect(response).to.be.instanceof(TransactionResponse);

                // 6. Get a receipt
                const receipt = await response.getReceipt(client);
                expect(receipt).to.be.an.instanceof(TransactionReceipt);
                expect(receipt.status.toString()).to.be.equal("SUCCESS");
            } catch (error) {
                console.log(error);
            }
        });

        // Example: serialize-deserialize-5
        it("should serialize and deserialize so-called incompleted transaction, set transaction id and execute it", async function () {
            this.timeout(120000);
            try {
                // 1. Create transaction
                const transaction = new TransferTransaction()
                    .addHbarTransfer(operatorId, new Hbar(-1))
                    .addHbarTransfer(recipientId, new Hbar(1));

                // 2. Serialize transaction into bytes
                const transactionBytes = transaction.toBytes();

                // 3. Deserialize transaction from bytes
                let transactionFromBytes =
                    Transaction.fromBytes(transactionBytes);

                expect(hex.encode(transactionBytes)).to.be.equal(
                    hex.encode(transactionFromBytes.toBytes()),
                );
                expect(
                    transactionFromBytes._nodeAccountIds.isEmpty,
                ).to.be.equal(true);
                expect(
                    transactionFromBytes._transactionIds.isEmpty,
                ).to.be.equal(true);

                // 4. Set transaction id
                const validStart = new Timestamp(
                    Math.floor(Date.now() / 1000),
                    0,
                );
                const transactionId = new TransactionId(operatorId, validStart);
                transactionFromBytes.setTransactionId(transactionId);

                expect(
                    transactionFromBytes._transactionIds.get(0).toString(),
                ).to.be.equal(transactionId.toString());

                // 5. Freeze, sign and execute transaction
                const response = await (
                    await transactionFromBytes
                        .freezeWith(client)
                        .sign(recipientKey)
                ).execute(client);
                expect(response).to.be.instanceof(TransactionResponse);

                // 6. Get a receipt
                const receipt = await response.getReceipt(client);
                expect(receipt).to.be.an.instanceof(TransactionReceipt);
                expect(receipt.status.toString()).to.be.equal("SUCCESS");
            } catch (error) {
                console.log(error);
            }
        });

        // Example: serialize-deserialize-6
        it("should serialize and deserialize so-called incompleted transaction, update and execute it", async function () {
            this.timeout(120000);
            const amount = new Hbar(1);
            try {
                // 1. Create transaction
                const transaction = new TransferTransaction().addHbarTransfer(
                    operatorId,
                    amount.negated(),
                );

                // 2. Serialize transaction into bytes
                const transactionBytes = transaction.toBytes();

                // 3. Deserialize transaction from bytes
                const transactionFromBytes =
                    Transaction.fromBytes(transactionBytes);

                expect(hex.encode(transactionBytes)).to.be.equal(
                    hex.encode(transactionFromBytes.toBytes()),
                );
                expect(
                    transactionFromBytes._nodeAccountIds.isEmpty,
                ).to.be.equal(true);
                expect(
                    transactionFromBytes._transactionIds.isEmpty,
                ).to.be.equal(true);
                expect(transactionFromBytes._hbarTransfers.length).to.be.equal(
                    1,
                );

                // 4. Check the transaction type and use particular method of
                // the corresponding class in order to update the transaction
                if (transactionFromBytes instanceof TransferTransaction) {
                    transactionFromBytes.addHbarTransfer(recipientId, amount);
                }

                expect(transactionFromBytes._hbarTransfers.length).to.be.equal(
                    2,
                );
                expect(
                    transactionFromBytes._hbarTransfers[1].accountId.toString(),
                ).to.be.equal(recipientId.toString());
                expect(
                    transactionFromBytes._hbarTransfers[1].amount.toString(),
                ).to.be.equal(amount.toString());

                // 4. Freeze, sign and execute transaction
                const response = await (
                    await transactionFromBytes
                        .freezeWith(client)
                        .sign(recipientKey)
                ).execute(client);
                expect(response).to.be.instanceof(TransactionResponse);

                // 5. Get a receipt
                const receipt = await response.getReceipt(client);
                expect(receipt).to.be.an.instanceof(TransactionReceipt);
                expect(receipt.status.toString()).to.be.equal("SUCCESS");
            } catch (error) {
                console.log(error);
            }
        });

        // Example: serialize-deserialize-7
        it("should serialize and deserialize so-called signed transaction (chunked), and execute it", async function () {
            this.timeout(120000);
            try {
                // 1. Create transaction and freeze it
                const transaction = await new FileCreateTransaction()
                    .setKeys([operatorKey.publicKey])
                    .setContents("[e2e::FileCreateTransaction]")
                    .freezeWithSigner(wallet);

                // 2. Serialize transaction into bytes
                const transactionBytes = transaction.toBytes();

                // 3. Deserialize transaction from bytes
                const transactionFromBytes =
                    Transaction.fromBytes(transactionBytes);

                expect(hex.encode(transactionBytes)).to.be.equal(
                    hex.encode(transactionFromBytes.toBytes()),
                );

                // 4. Sign and execute transaction
                const response = await (
                    await transactionFromBytes.signWithSigner(wallet)
                ).executeWithSigner(wallet);
                expect(response).to.be.instanceof(TransactionResponse);

                // 5. Get a receipt
                const receipt = await response.getReceiptWithSigner(wallet);
                expect(receipt).to.be.an.instanceof(TransactionReceipt);
                expect(receipt.status.toString()).to.be.equal("SUCCESS");
            } catch (error) {
                console.log(error);
            }
        });

        // Example: serialize-deserialize-8
        it("should serialize and deserialize so-called incompleted transaction (chunked), and execute it", async function () {
            this.timeout(120000);
            try {
                // 1. Create transaction
                const transaction = new FileCreateTransaction()
                    .setKeys([operatorKey.publicKey])
                    .setContents("[e2e::FileCreateTransaction]");

                // 2. Serialize transaction into bytes
                const transactionBytes = transaction.toBytes();

                // 3. Deserialize transaction from bytes
                const transactionFromBytes =
                    Transaction.fromBytes(transactionBytes);
                expect(hex.encode(transactionBytes)).to.be.equal(
                    hex.encode(transactionFromBytes.toBytes()),
                );
                expect(
                    transactionFromBytes._nodeAccountIds.isEmpty,
                ).to.be.equal(true);
                expect(
                    transactionFromBytes._transactionIds.isEmpty,
                ).to.be.equal(true);

                // 4. Freeze, sign and execute transaction
                const response = await (
                    await (
                        await transactionFromBytes.freezeWithSigner(wallet)
                    ).signWithSigner(wallet)
                ).executeWithSigner(wallet);
                expect(response).to.be.instanceof(TransactionResponse);

                // 5. Get a receipt
                const receipt = await response.getReceiptWithSigner(wallet);
                expect(receipt).to.be.an.instanceof(TransactionReceipt);
                expect(receipt.status.toString()).to.be.equal("SUCCESS");
            } catch (error) {
                console.log(error);
            }
        });

        // Example: serialize-deserialize-9
        it("should serialize and deserialize so-called incompleted transaction (chunked), update and execute it", async function () {
            this.timeout(120000);
            try {
                // 1. Create transaction
                const transaction = new FileCreateTransaction()
                    .setKeys([operatorKey.publicKey])
                    .setContents("[e2e::FileCreateTransaction]");

                // 2. Serialize transaction into bytes
                const transactionBytes = transaction.toBytes();

                // 3. Deserialize transaction from bytes
                const transactionFromBytes =
                    Transaction.fromBytes(transactionBytes);
                expect(hex.encode(transactionBytes)).to.be.equal(
                    hex.encode(transactionFromBytes.toBytes()),
                );
                expect(
                    transactionFromBytes._nodeAccountIds.isEmpty,
                ).to.be.equal(true);
                expect(
                    transactionFromBytes._transactionIds.isEmpty,
                ).to.be.equal(true);

                // 4. Check the transaction type and use particular method of
                // the corresponding class in order to update the transaction
                if (transactionFromBytes instanceof FileCreateTransaction) {
                    transactionFromBytes.setFileMemo("Test");
                }
                expect(transactionFromBytes.fileMemo).to.be.equal("Test");

                // 5. Freeze, sign and execute transaction
                const response = await (
                    await (
                        await transactionFromBytes.freezeWithSigner(wallet)
                    ).signWithSigner(wallet)
                ).executeWithSigner(wallet);
                expect(response).to.be.instanceof(TransactionResponse);

                // 6. Get a receipt
                const receipt = await response.getReceiptWithSigner(wallet);
                expect(receipt).to.be.an.instanceof(TransactionReceipt);
                expect(receipt.status.toString()).to.be.equal("SUCCESS");
            } catch (error) {
                console.log(error);
            }
        });

        // Example: serialize-deserialize-10
        it("should serialize and deserialize so-called incompleted transaction (chunked), set transaction id and execute it", async function () {
            this.timeout(120000);
            try {
                // 1. Create transaction
                const transaction = new FileCreateTransaction()
                    .setKeys([operatorKey.publicKey])
                    .setContents("[e2e::FileCreateTransaction]");

                // 2. Serialize transaction into bytes
                const transactionBytes = transaction.toBytes();

                // 3. Deserialize transaction from bytes
                let transactionFromBytes =
                    Transaction.fromBytes(transactionBytes);
                expect(hex.encode(transactionBytes)).to.be.equal(
                    hex.encode(transactionFromBytes.toBytes()),
                );
                expect(
                    transactionFromBytes._nodeAccountIds.isEmpty,
                ).to.be.equal(true);
                expect(
                    transactionFromBytes._transactionIds.isEmpty,
                ).to.be.equal(true);

                // 4. Set transaction id
                const validStart = new Timestamp(
                    Math.floor(Date.now() / 1000),
                    0,
                );
                const transactionId = new TransactionId(operatorId, validStart);
                transactionFromBytes.setTransactionId(transactionId);
                expect(
                    transactionFromBytes._transactionIds.get(0).toString(),
                ).to.be.equal(transactionId.toString());

                // 5. Freeze, sign and execute transaction
                const response = await (
                    await (
                        await transactionFromBytes.freezeWithSigner(wallet)
                    ).signWithSigner(wallet)
                ).executeWithSigner(wallet);
                expect(response).to.be.instanceof(TransactionResponse);

                // 6. Get a receipt
                const receipt = await response.getReceiptWithSigner(wallet);
                expect(receipt).to.be.an.instanceof(TransactionReceipt);
                expect(receipt.status.toString()).to.be.equal("SUCCESS");
            } catch (error) {
                console.log(error);
            }
        });

        // Example: serialize-deserialize-11
        it("should serialize and deserialize so-called incompleted transaction (chunked), set node account ids and execute it", async function () {
            this.timeout(120000);
            console.log("WALLET", wallet);
            try {
                // 1. Create transaction
                const transaction = new FileCreateTransaction()
                    .setKeys([operatorKey.publicKey])
                    .setContents("[e2e::FileCreateTransaction]");

                // 2. Serialize transaction into bytes
                const transactionBytes = transaction.toBytes();

                // 3. Deserialize transaction from bytes
                let transactionFromBytes =
                    Transaction.fromBytes(transactionBytes);
                expect(hex.encode(transactionBytes)).to.be.equal(
                    hex.encode(transactionFromBytes.toBytes()),
                );
                expect(
                    transactionFromBytes._nodeAccountIds.isEmpty,
                ).to.be.equal(true);
                expect(
                    transactionFromBytes._transactionIds.isEmpty,
                ).to.be.equal(true);

                // 4. Set node accoutn ids
                const nodeAccountId = new AccountId(3);
                transactionFromBytes.setNodeAccountIds([nodeAccountId]);
                expect(
                    transactionFromBytes._nodeAccountIds.get(0).toString(),
                ).to.be.equal(nodeAccountId.toString());

                // 5. Freeze, sign and execute transaction
                const response = await (
                    await (
                        await transactionFromBytes.freezeWithSigner(wallet)
                    ).signWithSigner(wallet)
                ).executeWithSigner(wallet);
                expect(response).to.be.instanceof(TransactionResponse);

                // 6. Get a receipt
                const receipt = await response.getReceiptWithSigner(wallet);
                expect(receipt).to.be.an.instanceof(TransactionReceipt);
                expect(receipt.status.toString()).to.be.equal("SUCCESS");
            } catch (error) {
                console.log(error);
            }
        });
    });
});
