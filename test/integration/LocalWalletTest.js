import { LocalWallet } from "../../src/index.js";

describe("LocalWallet", function () {
    it("can fetch wallet's info", async function () {
        this.timeout(120000);

        const wallet = new LocalWallet();
        const info = await wallet.getAccountInfo();

        expect(info.accountId.compare(wallet.getAccountId())).to.be.equal(0);
    });
});
