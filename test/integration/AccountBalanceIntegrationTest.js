import AccountCreateTransaction from "../src/account/AccountCreateTransaction";
import AccountDeleteTransaction from "../src/account/AccountDeleteTransaction";
import AccountBalanceQuery from "../src/account/AccountBalanceQuery";
import Hbar from "../src/Hbar";
import TransactionId from "../src/TransactionId";
import newClient from "./IntegrationClient";
import { PrivateKey } from "../src/index";

describe("AccountBalance", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const client = newClient();
        const operatorId = client.getOperatorId();
        const key = PrivateKey.generate();

        const response = await new AccountCreateTransaction()
            .setKey(key.getPublicKey())
            .setMaxTransactionFee(new Hbar(2))
            .setInitialBalance(new Hbar(1))
            .execute(client);

        const receipt = await response.getReceipt(client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        const balance = await new AccountBalanceQuery()
            .setAccountId(account)
            .setNodeId(response.nodeId)
            .execute(client);

        expect(balance.toTinybars().toInt()).to.be.equal(
            new Hbar(1).toTinybars().toInt()
        );

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setNodeId(response.nodeId)
                    .setTransferAccountId(operatorId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(client)
                    .sign(key)
            ).execute(client)
        ).getReceipt(client);
    });
});
