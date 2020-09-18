import Hbar from "../src/Hbar";
import newClient from "./IntegrationClient";
import AccountStakersQuery from "../../src/account/AccountStakersQuery";
import HederaPreCheckStatusError from "../../src/HederaPreCheckStatusError";

describe("AccountStakers", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const client = newClient();
        const operatorId = client.getOperatorId();

        expect(
            await new AccountStakersQuery()
                .setAccountId(operatorId)
                .setMaxQueryPayment(new Hbar(1))
                .execute(client)
        ).to.throw(HederaPreCheckStatusError.class);
    });
});
