import {
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
    AccountId,
    KeyList,
    Status,
    FileAppendTransaction,
    FileCreateTransaction,
    TransactionId,
} from "../../src/exports.js";
import dotenv from "dotenv";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";
import SignatureMap from "../../src/transaction/SignatureMap.js";

import { proto } from "@hashgraph/proto";
import { expect } from "chai";

dotenv.config();

describe("PrivateKey signTransaction", function () {
    let env, user1Key, user2Key, createdAccountId, keyList;

    // Setting up the environment and creating a new account with a key list
    before(async function () {
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

    // this skip is temporary before we add SOLO for the CI tests
    // as currently its unable to run the test with multiple nodes
    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip("File Append Transaction Execution with Multiple Nodes", async function () {
        // Create file
        let response = await new FileCreateTransaction()
            .setKeys([env.operatorKey])
            .setContents("[e2e::FileCreateTransaction]")
            .execute(env.client);

        let createTxReceipt = await response.getReceipt(env.client);
        const file = createTxReceipt.fileId;

        // Append content to the file
        const fileAppendTx = new FileAppendTransaction()
            .setFileId(file)
            .setContents("test")
            .setChunkSize(1)
            .setNodeAccountIds([
                new AccountId(3),
                new AccountId(4),
                new AccountId(5),
            ])
            .freezeWith(env.client);

        const sigMap = new SignatureMap();
        fileAppendTx._signedTransactions.list.forEach((signedTx) => {
            const sig = env.operatorKey.sign(signedTx.bodyBytes);
            const decodedTx = proto.TransactionBody.decode(signedTx.bodyBytes);
            const nodeId = AccountId._fromProtobuf(decodedTx.nodeAccountID);
            const transactionId = TransactionId._fromProtobuf(
                decodedTx.transactionID,
            );

            sigMap.addSignature(
                nodeId,
                transactionId,
                env.operatorKey.publicKey,
                sig,
            );
        });

        //console.log(sigMap);

        fileAppendTx.addSignature(env.operatorKey.publicKey, sigMap);

        // Execute the signed transaction
        const receipt = await (
            await fileAppendTx.execute(env.client)
        ).getReceipt(env.client);

        expect(receipt.status).to.be.equal(Status.Success);
    });
});
