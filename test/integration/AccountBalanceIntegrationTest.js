import Hbar from "../src/Hbar.js";
import AccountBalanceQuery from "../src/account/AccountBalanceQuery.js";
import { newIntegrationClient } from "./client/index.js";

describe("AccountBalanceQuery", function () {
    this.timeout(15000);
    let client;

    before(function () {
        client = newIntegrationClient();
    });

    describe("#execute", function () {
        it("account 0.0.3 should have a balance higher than 1 hbar", async function () {
            const balance = await new AccountBalanceQuery()
                .setAccountId("3") // balance of node 3
                .execute(client);

            expect(balance.toTinybars().toNumber()).to.be.greaterThan(
                new Hbar(1).toTinybars().toNumber()
            );
        });

        // TODO: After we have PreCheckError
        // it("an account that does not exist should return an error", async function () {
        //     await new AccountBalanceQuery()
        //         .setAccountId("0.0.21849819482")
        //         .execute(client);
        // });
    });
});
