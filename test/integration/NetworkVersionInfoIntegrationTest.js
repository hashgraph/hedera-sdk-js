import newClient from "./IntegrationClient";
import NetworkVersionInfoQuery from "../src/NetworkVersionInfoQuery";

describe("NetworkVersionInfo", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const client = newClient();
        let errorThrown = false;

        try {
            await new NetworkVersionInfoQuery()
                .execute(client);
        } catch (_) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.false;
    });
});
