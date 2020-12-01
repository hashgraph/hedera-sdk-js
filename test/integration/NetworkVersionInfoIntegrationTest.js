import newClient from "./client/index.js";
import { NetworkVersionInfoQuery } from "../../src/exports.js";

describe("NetworkVersionInfo", function () {
    it("should be executable", async function () {
        this.timeout(15000);

        const client = await newClient();

        await new NetworkVersionInfoQuery().execute(client);
    });
});
