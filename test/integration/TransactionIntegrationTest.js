import Hbar from "../src/Hbar.js";
import AccountId from "../src/account/AccountId.js";
import newClient from "./client/index.js";
import { PrivateKey } from "../src/index.js";
import AccountCreateTransaction from "../src/account/AccountCreateTransaction.js";
import AccountDeleteTransaction from "../../src/account/AccountDeleteTransaction.js";
import * as hex from "../../src/encoding/hex.js";

describe("TransactionIntegration", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const client = newClient();
        const operatorId = client.operatorAccountId;
        expect(operatorId).to.not.be.null;

        const key = PrivateKey.generate();

        const transaction = await new AccountCreateTransaction()
            .setKey(key.publicKey)
            .setNodeAccountId(new AccountId(3))
            .setMaxTransactionFee(new Hbar(2))
            .freezeWith(client)
            .signWithOperator(client);

        const expectedHash = await transaction.transactionHash;

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
                    .setNodeAccountId(response.nodeId)
                    .setTransferAccountId(operatorId)
                    .freezeWith(client)
                    .sign(key)
            ).execute(client)
        ).getReceipt(client);
    });
});
