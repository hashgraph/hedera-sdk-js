import {
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
    AccountId,
    KeyList,
    TransferTransaction,
    Transaction,
    Status,
    FileAppendTransaction,
    FileCreateTransaction,
} from "../../src/exports.js";
import dotenv from "dotenv";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

import { expect } from "chai";

dotenv.config();

describe("PrivateKey signTransaction", function () {
    let env, user1Key, user2Key, createdAccountId, keyList;

    // Setting up the environment and creating a new account with a key list
    before(async () => {
        env = await IntegrationTestEnv.new();

        user1Key = PrivateKey.generate();
        user2Key = PrivateKey.generate();
        keyList = new KeyList([user1Key.publicKey, user2Key.publicKey]);

        // Create account
        const createAccountTransaction = new AccountCreateTransaction()
            .setInitialBalance(new Hbar(2))
            .setKey(keyList);

        const createResponse = await createAccountTransaction.execute(
            env.client,
        );
        const createReceipt = await createResponse.getReceipt(env.client);

        createdAccountId = createReceipt.accountId;

        expect(createdAccountId).to.exist;
    });

    it("Transfer Transaction Execution with Multiple Nodes", async () => {
        // Create and sign transfer transaction
        const transferTransaction = new TransferTransaction()
            .addHbarTransfer(createdAccountId, new Hbar(-1))
            .addHbarTransfer("0.0.3", new Hbar(1))
            .setNodeAccountIds([
                new AccountId(3),
                new AccountId(4),
                new AccountId(5),
            ])
            .freezeWith(env.client);

        // Serialize and sign the transaction
        const transferTransactionBytes = transferTransaction.toBytes();
        const user1Signatures = user1Key.signTransaction(transferTransaction);
        const user2Signatures = user2Key.signTransaction(transferTransaction);

        // Deserialize the transaction and add signatures
        const signedTransaction = Transaction.fromBytes(
            transferTransactionBytes,
        );
        signedTransaction.addSignature(user1Key.publicKey, user1Signatures);
        signedTransaction.addSignature(user2Key.publicKey, user2Signatures);

        // Execute the signed transaction
        const result = await signedTransaction.execute(env.client);
        const receipt = await result.getReceipt(env.client);

        expect(receipt.status).to.be.equal(Status.Success);
    });

    it("File Append Transaction Execution with Multiple Nodes", async () => {
        const operatorKey = env.operatorKey.publicKey;

        // Create file
        let response = await new FileCreateTransaction()
            .setKeys([operatorKey])
            .setContents("[e2e::FileCreateTransaction]")
            .execute(env.client);

        let createTxReceipt = await response.getReceipt(env.client);
        const file = createTxReceipt.fileId;

        // Append content to the file
        const fileAppendTx = new FileAppendTransaction()
            .setFileId(file)
            .setContents("[e2e::FileAppendTransaction]")
            .setNodeAccountIds([
                new AccountId(3),
                new AccountId(4),
                new AccountId(5),
            ])
            .freezeWith(env.client);

        // Serialize and sign the transaction
        const fileAppendTransactionBytes = fileAppendTx.toBytes();
        const user1Signatures = user1Key.signTransaction(fileAppendTx);
        const user2Signatures = user2Key.signTransaction(fileAppendTx);

        // Deserialize the transaction and add signatures
        const signedTransaction = Transaction.fromBytes(
            fileAppendTransactionBytes,
        );
        signedTransaction.addSignature(user1Key.publicKey, user1Signatures);
        signedTransaction.addSignature(user2Key.publicKey, user2Signatures);

        // Execute the signed transaction
        const result = await signedTransaction.execute(env.client);
        const receipt = await result.getReceipt(env.client);

        expect(receipt.status).to.be.equal(Status.Success);
    });
});
