import { LocalWallet } from "../../src/index.js";

describe("LocalWallet", function () {
    it("an account that does not exist should return an error", async function () {
        this.timeout(120000);

        const wallet = new LocalWallet();
        const info = await wallet.getAccountInfo();

        expect(info.accountId.compare(wallet.getAccountId())).to.be.equal(0);
    });
});
