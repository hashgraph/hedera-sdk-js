import Hbar from "../src/Hbar.js";
import AccountCreateTransaction from "../src/account/AccountCreateTransaction.js";
import TransactionId from "../src/transaction/TransactionId.js";
import LiveHashAddTransaction from "../src/account/LiveHashAddTransaction.js";
import LiveHashDeleteTransaction from "../src/account/LiveHashDeleteTransaction.js";
import LiveHashQuery from "../src/account/LiveHashQuery.js";
import TransactionReceiptQuery from "../../src/transaction/TransactionReceiptQuery.js";
import newClient from "./client/index.js";
import { PrivateKey } from "../src/index.js";
import Long from "long";
import * as hex from "../src/encoding/hex.js";
import AccountDeleteTransaction from "../src/account/AccountDeleteTransaction.js";

describe("LiveHash", function () {
    it("should be executable", async function () {
        this.timeout(15000);

        const _hash = hex.decode(
            "100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002"
        );

        const client = await newClient();
        const operatorId = client.operatorAccountId;
        let errorThrown = false;

        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key.publicKey)
            .setMaxTransactionFee(new Hbar(2))
            .setInitialBalance(new Hbar(1))
            .execute(client);

        let receipt = await new TransactionReceiptQuery()
            .setNodeAccountIds([response.nodeId])
            .setTransactionId(response.transactionId)
            .execute(client);

        expect(receipt.accountId).to.not.be.null;
        expect(receipt.accountId != null ? receipt.accountId.num > 0 : false).to
            .be.true;

        const account = receipt.accountId;

        try {
            await new LiveHashAddTransaction()
                .setAccountId(account)
                .setNodeAccountIds([response.nodeId])
                .setDuration(Long.fromInt(30))
                .setHash(_hash)
                .setKeys(key)
                .execute(client);
        } catch (_) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;
        errorThrown = false;

        try {
            await new LiveHashDeleteTransaction()
                .setAccountId(account)
                .setNodeAccountIds([response.nodeId])
                .setHash(_hash)
                .execute(client);
        } catch (_) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;
        errorThrown = false;

        try {
            await new LiveHashQuery()
                .setAccountId(account)
                .setNodeAccountIds([response.nodeId])
                .setHash(_hash)
                .execute(client);
        } catch (_) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setMaxTransactionFee(new Hbar(1))
                    .setNodeAccountIds([response.nodeId])
                    .setTransferAccountId(operatorId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(client)
                    .sign(key)
            ).execute(client)
        ).getReceipt(client);
    });
});
