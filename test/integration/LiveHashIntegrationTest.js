import {
    AccountCreateTransaction,
    AccountDeleteTransaction,
    Hbar,
    LiveHashAddTransaction,
    LiveHashDeleteTransaction,
    LiveHashQuery,
    PrivateKey,
    TransactionId,
    TransactionReceiptQuery,
} from "../src/exports.js";
import * as hex from "../src/encoding/hex.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";
import Long from "long";

describe("LiveHash", function () {
    it("should be executable", async function () {
        this.timeout(120000);

        const _hash = hex.decode(
            "100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002"
        );

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        let errorThrown = false;

        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key.publicKey)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        let receipt = await new TransactionReceiptQuery()
            .setTransactionId(response.transactionId)
            .execute(env.client);

        expect(receipt.accountId).to.not.be.null;
        expect(receipt.accountId != null ? receipt.accountId.num > 0 : false).to
            .be.true;

        const account = receipt.accountId;

        try {
            await new LiveHashAddTransaction()
                .setAccountId(account)
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
                .setHash(_hash)
                .execute(env.client);
        } catch (_) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;

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

        await env.close();
    });
});
