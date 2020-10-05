import AccountCreateTransaction from "../src/account/AccountCreateTransaction";
import Hbar from "../src/Hbar";
import LiveHashAddTransaction from "../src/account/LiveHashAddTransaction";
import LiveHashDeleteTransaction from "../src/account/LiveHashDeleteTransaction";
import LiveHashQuery from "../src/account/LiveHashQuery";
import TransactionReceiptQuery from "../src/TransactionReceiptQuery";
import newClient from "./client";
import { PrivateKey } from "../src/index";
import Long from "long";
import * as hex from "../src/encoding/hex";
import AccountDeleteTransaction from "../src/account/AccountDeleteTransaction";

describe("LiveHash", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const _hash = hex.decode(
            "100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002"
        );

        const client = newClient();
        const operatorId = client.operatorAccountId;
        let errorThrown = false;

        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key.publicKey)
            .setMaxTransactionFee(new Hbar(2))
            .setInitialBalance(new Hbar(1))
            .execute(client);

        let receipt = await new TransactionReceiptQuery()
            .setNodeId(response.nodeId)
            .setTransactionId(response.transactionId)
            .execute(client);

        expect(receipt.accountId).to.not.be.null;
        expect(receipt.accountId != null ? receipt.accountId.num > 0 : false).to
            .be.true;

        const account = receipt.accountId;

        try {
            await new LiveHashAddTransaction()
                .setAccountId(account)
                .setNodeId(response.nodeId)
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
                .setNodeId(response.nodeId)
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
                .setNodeId(response.nodeId)
                .setHash(_hash)
                .execute(client);
        } catch (_) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;

        await (
            await new AccountDeleteTransaction()
                .setAccountId(account)
                .setNodeId(response.nodeId)
                .setTransferAccountId(operatorId)
                .execute(client)
        ).getReceipt(client);
    });
});
