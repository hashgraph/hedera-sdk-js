import Hbar from "../src/Hbar.js";
import newClient from "./client/index.js";
import AccountBalanceQuery from "../src/account/AccountBalanceQuery.js";
import AccountId from "../src/account/AccountId.js";

describe("ClientIntegration", function () {
    it("should be executable", async function () {
        this.timeout(15000);

        const client = await newClient();

        client.setNetwork({
            "0.testnet.hedera.com:50211": new AccountId(3),
            "1.testnet.hedera.com:50211": new AccountId(4),
        });

        const operatorId = client.operatorAccountId;
        expect(operatorId).to.not.be.null;

        await new AccountBalanceQuery()
            .setAccountId(operatorId)
            .execute(client);

        await new AccountBalanceQuery()
            .setAccountId(operatorId)
            .execute(client);

        client.setNetwork({
            "1.testnet.hedera.com:50211": new AccountId(4),
            "2.testnet.hedera.com:50211": new AccountId(5),
        });

        client.setNetwork({
            "35.186.191.247:50211": new AccountId(4),
            "35.192.2.25:50211": new AccountId(5),
        });
    });
});
