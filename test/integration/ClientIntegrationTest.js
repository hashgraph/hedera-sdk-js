import Hbar from "../src/Hbar";
import newClient from "./IntegrationClient";
import AccountBalanceQuery from "../src/account/AccountBalanceQuery";
import AccountId from "../src/account/AccountId";

describe("ClientIntegration", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const client = newClient().setMaxQueryPayment(new Hbar(2));

        client._setNetwork({
            "0.testnet.hedera.com:50211": new AccountId(3),
            "1.testnet.hedera.com:50211": new AccountId(4)
        });

        const operatorId = client.getOperatorId();
        expect(operatorId).to.not.be.null;

        await new AccountBalanceQuery()
            .setAccountId(operatorId)
            .execute(client);

        await new AccountBalanceQuery()
            .setAccountId(operatorId)
            .execute(client);

        client._setNetwork({
            "1.testnet.hedera.com:50211": new AccountId(4),
            "2.testnet.hedera.com:50211": new AccountId(5)
        });

        client._setNetwork({
            "35.186.191.247:50211": new AccountId(4),
            "35.192.2.25:50211": new AccountId(5)
        });
    });
});
