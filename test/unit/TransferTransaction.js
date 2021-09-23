import TransferTransaction from "../src/account/TransferTransaction.js";
import HbarUnit from "../src/HbarUnit.js";
import Hbar from "../src/Hbar.js";

describe("TransferTransaction", function () {
    it("should combine multiple same accountId tansfers into one transfer", function () {
        const expectedHbar = 3;
        const accountId = "0.0.0";

        const transfer = new TransferTransaction()
            .addHbarTransfer(accountId, 1)
            .addHbarTransfer(accountId, 1);

        transfer.addHbarTransfer(accountId, 1);
        transfer.addHbarTransfer("0.0.1", 1);

        expect(
            transfer.hbarTransfers.get(accountId).to(HbarUnit.Hbar).toNumber()
        ).to.be.equal(new Hbar(expectedHbar).to(HbarUnit.Hbar).toNumber());
    });
});
