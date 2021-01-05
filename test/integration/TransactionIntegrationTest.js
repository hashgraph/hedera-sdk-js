import Hbar from "../src/Hbar.js";
import AccountId from "../src/account/AccountId.js";
import newClient from "./client/index.js";
import { PrivateKey } from "../src/index.js";
import AccountCreateTransaction from "../src/account/AccountCreateTransaction.js";
import AccountDeleteTransaction from "../../src/account/AccountDeleteTransaction.js";
import TokenCreateTransaction from "../../src/token/TokenCreateTransaction.js";
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
});
