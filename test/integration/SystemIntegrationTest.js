import newClient from "./client/index.js";
import SystemDeleteTransaction from "../../src/system/SystemDeleteTransaction.js";
import ContractId from "../src/contract/ContractId.js";
import FileId from "../src/file/FileId.js";
import Timestamp from "../src/Timestamp.js";

describe("SystemIntegration", function () {
    it("should be executable", async function () {
        this.timeout(15000);

        const client = await newClient();
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
