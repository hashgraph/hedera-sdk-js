import {
    ContractId,
    FileId,
    SystemDeleteTransaction,
    Timestamp,
} from "../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("SystemIntegration", function () {
    it("should be executable", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();
        let errorThrown = false;

        try {
            await new SystemDeleteTransaction()
                .setContractId(new ContractId(10))
                .setExpirationTime(Timestamp.generate())
                .execute(env.client);
        } catch (_) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;
        errorThrown = false;

        try {
            await new SystemDeleteTransaction()
                .setFileId(new FileId(10))
                .setExpirationTime(Timestamp.generate())
                .execute(env.client);
        } catch (_) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;
        errorThrown = false;

        try {
            await new SystemDeleteTransaction()
                .setContractId(new ContractId(10))
                .execute(env.client);
        } catch (_) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;
        errorThrown = false;

        try {
            await new SystemDeleteTransaction()
                .setFileId(new FileId(10))
                .execute(env.client);
        } catch (_) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;

        await env.close();
    });
});
