import {
    AccountId,
    PrivateKey,
    AccountCreateTransaction,
    AccountDeleteTransaction,
    TokenCreateTransaction,
    TransferTransaction,
    Hbar,
} from "../src/index.js";
import newClient from "./client/index.js";
import * as hex from "../../src/encoding/hex.js";

describe("TransactionIntegration", function () {
    it("should be executable", async function () {
        this.timeout(15000);

        const client = await newClient();
        const operatorId = client.operatorAccountId;
        expect(operatorId).to.not.be.null;

        const key = PrivateKey.generate();

        const transaction = await new AccountCreateTransaction()
            .setNodeAccountIds([new AccountId(3)])
            .setKey(key.publicKey)
            .freezeWith(client)
            .signWithOperator(client);

        const expectedHash = await transaction.getTransactionHash();

        const response = await transaction.execute(client);

        const record = await response.getRecord(client);

        expect(hex.encode(expectedHash)).to.be.equal(
            hex.encode(record.transactionHash)
        );

        const account = record.receipt.accountId;
        expect(account).to.not.be.null;

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setNodeAccountIds([response.nodeId])
                    .setTransferAccountId(operatorId)
                    .freezeWith(client)
                    .sign(key)
            ).execute(client)
        ).getReceipt(client);
    });

    it("signs correctly", async function () {
        const client = await newClient();
        const key = PrivateKey.generate();

        let transaction = await (
            await new TokenCreateTransaction()
                .setAdminKey(key.publicKey)
                .setNodeAccountIds([new AccountId(3)])
                .freezeWith(client)
                .sign(key)
        ).signWithOperator(client);

        expect(transaction._signedTransactions[0].sigMap.sigPair.length).to.eql(
            2
        );

        transaction = await (
            await new TokenCreateTransaction()
                .setAdminKey(key.publicKey)
                .setNodeAccountIds([new AccountId(3)])
                .freezeWith(client)
                .signWithOperator(client)
        ).sign(key);

        expect(transaction._signedTransactions[0].sigMap.sigPair.length).to.eql(
            2
        );
    });

    it("issue-327", async function () {
        const client = await newClient();
        const privateKey1 = PrivateKey.generate();
        const privateKey2 = PrivateKey.generate();
        const privateKey3 = PrivateKey.generate();
        const privateKey4 = PrivateKey.generate();
        const publicKey1 = privateKey1.publicKey;
        const publicKey2 = privateKey2.publicKey;
        const publicKey3 = privateKey3.publicKey;
        const publicKey4 = privateKey4.publicKey;

        const transaction = await new TransferTransaction()
            .setNodeAccountIds([new AccountId(3)])
            .addHbarTransfer(client.operatorAccountId, new Hbar(1).negated())
            .addHbarTransfer(new AccountId(3), new Hbar(1))
            .freezeWith(client);

        const signature1 = privateKey1.signTransaction(transaction);
        const signature2 = privateKey2.signTransaction(transaction);
        const signature3 = privateKey3.signTransaction(transaction);

        transaction
            .addSignature(publicKey1, signature1)
            .addSignature(publicKey2, signature2)
            .addSignature(publicKey3, signature3);

        const signatures = transaction.getSignatures();

        const nodeSignatures = signatures.get(new AccountId(3));

        const publicKey1Signature = nodeSignatures.get(publicKey1);
        const publicKey2Signature = nodeSignatures.get(publicKey2);
        const publicKey3Signature = nodeSignatures.get(publicKey3);
        const publicKey4Signature = nodeSignatures.get(publicKey4);

        expect(publicKey1Signature).to.be.not.null;
        expect(publicKey2Signature).to.be.not.null;
        expect(publicKey3Signature).to.be.not.null;
        expect(publicKey4Signature).to.be.null;
    });
});
