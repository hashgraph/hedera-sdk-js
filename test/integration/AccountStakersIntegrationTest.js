import Hbar from "../src/Hbar.js";
import newClient from "./client/index.js";
import AccountStakersQuery from "../../src/account/AccountStakersQuery.js";

describe("AccountStakers", function () {
    it("should be executable", async function () {
        this.timeout(15000);

        const client = await newClient();
        const operatorId = client.operatorAccountId;

        let errorThrown = false;

        try {
            await new AccountStakersQuery()
                .setAccountId(operatorId)
                .setMaxQueryPayment(new Hbar(1))
                .execute(client);
        } catch (_) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;
    });
});
