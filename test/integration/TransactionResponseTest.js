import * as hex from "../src/encoding/hex";
import AccountCreateTransaction from "../src/account/AccountCreateTransaction";
import AccountDeleteTransaction from "../src/account/AccountDeleteTransaction";
import AccountId from "../src/account/AccountId";
import Hbar from "../src/Hbar";
import newClient from "./IntegrationClient";
import { PrivateKey } from "../src/index";

describe("TransactionResponse", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const client = newClient();
        const operatorId = client.getOperatorId();
        expect(operatorId).to.not.be.null;

        const key = PrivateKey.generate();

        const transaction = await new AccountCreateTransaction()
            .setKey(key.getPublicKey())
            .setNodeId(new AccountId(5))
            .setMaxTransactionFee(new Hbar(2))
            .execute(client);

        const record = await transaction.getRecord(client);

        expect(hex.encode(record.transactionHash)).to.be.equal(
            hex.encode(transaction.transactionHash)
        );

        const account = record.receipt.accountId;
        console.log(account + " node ");
        expect(account).to.not.be.null;

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setNodeId(transaction.nodeId)
                    .setTransferAccountId(operatorId)
                    .freezeWith(client)
                    .sign(key)
            ).execute(client)
        ).getReceipt(client);
    });
});
