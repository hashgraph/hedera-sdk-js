import * as hex from "../src/encoding/hex.js";
import AccountCreateTransaction from "../src/account/AccountCreateTransaction.js";
import AccountDeleteTransaction from "../src/account/AccountDeleteTransaction.js";
import IntegrationTestEnv from "./client/index.js";
import { PrivateKey } from "../src/index.js";

describe("TransactionResponse", function() {
    it("should be executable", async function() {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        expect(operatorId).to.not.be.null;

        const key = PrivateKey.generate();

        const transaction = await new AccountCreateTransaction()
            .setKey(key.publicKey)
            .setNodeAccountIds(env.nodeAccountIds)
            .execute(env.client);

        const record = await transaction.getRecord(env.client);

        expect(hex.encode(record.transactionHash)).to.be.equal(
            hex.encode(transaction.transactionHash)
        );

        const account = record.receipt.accountId;
        expect(account).to.not.be.null;

        await (await (await new AccountDeleteTransaction()
            .setAccountId(account)
            .setNodeAccountIds([transaction.nodeId])
            .setTransferAccountId(operatorId)
            .freezeWith(env.client)
            .sign(key)).execute(env.client)).getReceipt(env.client);
    });
});
