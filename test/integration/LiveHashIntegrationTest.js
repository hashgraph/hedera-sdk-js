import Hbar from "../src/Hbar.js";
import AccountCreateTransaction from "../src/account/AccountCreateTransaction.js";
import TransactionId from "../src/transaction/TransactionId.js";
import LiveHashAddTransaction from "../src/account/LiveHashAddTransaction.js";
import LiveHashDeleteTransaction from "../src/account/LiveHashDeleteTransaction.js";
import LiveHashQuery from "../src/account/LiveHashQuery.js";
import TransactionReceiptQuery from "../../src/transaction/TransactionReceiptQuery.js";
import IntegrationTestEnv from "./client/index.js";
import { PrivateKey } from "../src/index.js";
import Long from "long";
import * as hex from "../src/encoding/hex.js";
import AccountDeleteTransaction from "../src/account/AccountDeleteTransaction.js";

describe("LiveHash", function() {
    it("should be executable", async function() {
        this.timeout(60000);

        const _hash = hex.decode(
            "100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002"
        );

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        let errorThrown = false;

        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key.publicKey)
            .setNodeAccountIds(env.nodeAccountIds)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        let receipt = await new TransactionReceiptQuery()
            .setNodeAccountIds([response.nodeId])
            .setTransactionId(response.transactionId)
            .execute(env.client);

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
                .execute(env.client);
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
                .execute(env.client);
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
                .execute(env.client);
        } catch (_) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;

        await (await (await new AccountDeleteTransaction()
            .setAccountId(account)
            .setNodeAccountIds([response.nodeId])
            .setTransferAccountId(operatorId)
            .setTransactionId(TransactionId.generate(account))
            .freezeWith(env.client)
            .sign(key)).execute(env.client)).getReceipt(env.client);
    });
});
