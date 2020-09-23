import newClient from "./IntegrationClient";
import SystemDeleteTransaction from "../src/SystemDeleteTransaction";
import ContractId from "../src/contract/ContractId";
import FileId from "../src/file/FileId";
import Timestamp from "../src/Timestamp";

describe("SystemIntegration", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const client = newClient();
        let errorThrown = false;

        try {
            await new SystemDeleteTransaction()
                .setContractId(new ContractId(10))
                .setExpirationTime(Timestamp.generate())
                .execute(client);
        } catch (_) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;
        errorThrown = false;

        try {
            await new SystemDeleteTransaction()
                .setFileId(new FileId(10))
                .setExpirationTime(Timestamp.generate())
                .execute(client);
        } catch (_) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;
        errorThrown = false;

        try {
            await new SystemDeleteTransaction()
                .setContractId(new ContractId(10))
                .execute(client);
        } catch (_) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;
        errorThrown = false;

        try {
            await new SystemDeleteTransaction()
                .setFileId(new FileId(10))
                .execute(client);
        } catch (_) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;
    });
});
