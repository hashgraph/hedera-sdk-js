import { AccountBalanceQuery, Client } from "../../src/index.js";

describe("AccountBalance", function () {
    it("can query balance of node 0.0.3", async function () {
        const balance = await new AccountBalanceQuery()
            .setAccountId("0.0.3")
            .execute(Client.forTestnet());
        expect(balance.hbars.toTinybars().compare(0)).to.be.equal(1);
    });
});
