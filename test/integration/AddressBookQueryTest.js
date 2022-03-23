import { AddressBookQuery } from "../../src/exports.js";
import { Client } from "./client/NodeIntegrationTestEnv.js";

describe("AddressBookQuery", function () {
    it("should be executable", async function () {
        this.timeout(10000);

        const client = Client.forTestnet();

        const addressBook = await new AddressBookQuery()
            .setFileId("0.0.102")
            .execute(client);

        expect(addressBook.nodeAddresses.length).to.be.above(0);
    });
});
