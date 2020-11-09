import * as hex from "../src/encoding/hex.js";
import AccountCreateTransaction from "../src/account/AccountCreateTransaction.js";
import AccountDeleteTransaction from "../src/account/AccountDeleteTransaction.js";
import Hbar from "../src/Hbar.js";
import newClient from "./client/index.js";
import { PrivateKey } from "../src/index.js";

describe("TransactionResponse", function () {
    it("should be executable", async function () {
        this.timeout(15000);

        const client = await newClient();
        const operatorId = client.operatorAccountId;
        expect(operatorId).to.not.be.null;

        const key = PrivateKey.generate();

        const transaction = await new AccountCreateTransaction()
            .setKey(key.publicKey)
            .setMaxTransactionFee(new Hbar(2))
            .execute(client);

        const record = await transaction.getRecord(client);

        expect(hex.encode(record.transactionHash)).to.be.equal(
            hex.encode(transaction.transactionHash)
        );

        const account = record.receipt.accountId;
        expect(account).to.not.be.null;

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setNodeAccountIds([transaction.nodeId])
                    .setTransferAccountId(operatorId)
                    .freezeWith(client)
                    .sign(key)
            ).execute(client)
        ).getReceipt(client);
    });
});
