import Hbar from "../src/Hbar";
import newClient from "./IntegrationClient";
import { PrivateKey } from "../src/index";
import AccountCreateTransaction from "../src/account/AccountCreateTransaction";
import AccountId from "../src/account/AccountId";
import AccountDeleteTransaction from "../../src/account/AccountDeleteTransaction";
import * as hex from "../../src/encoding/hex";

describe("TransactionIntegration", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const client = newClient();
        const operatorId = client.getOperatorId();
        expect(operatorId).to.not.be.null;

        const key = PrivateKey.generate();

        const transaction = await new AccountCreateTransaction()
            .setKey(key.publicKey)
            .setNodeId(new AccountId(5))
            .setMaxTransactionFee(new Hbar(2))
            .freezeWith(client)
            .signWithOperator(client);

        const expectedHash = transaction.getTransactionHash();

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
                    .setNodeId(response.nodeId)
                    .setTransferAccountId(operatorId)
                    .freezeWith(client)
                    .sign(key)
            ).execute(client)
        ).getReceipt(client);
    });
});
