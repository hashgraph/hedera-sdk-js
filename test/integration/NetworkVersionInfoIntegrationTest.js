import newClient from "./client/index.js";
import NetworkVersionInfoQuery from "../../src/network/NetworkVersionInfoQuery.js";

describe("NetworkVersionInfo", function () {
    it("should be executable", async function () {
        this.timeout(15000);

        const client = await newClient();
        let errorThrown = false;

        try {
            await new NetworkVersionInfoQuery().execute(client);
        } catch (error) {
            errorThrown = true;
        }

        expect(errorThrown).to.be.true;
    });
});
