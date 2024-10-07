import { AddressBookQuery } from "../../src/exports.js";
import { Client } from "./client/NodeIntegrationTestEnv.js";

describe("AddressBookQuery", function () {
    it("should be query the addressbook on testnet", async function () {
        const client = Client.forTestnet();

        const addressBook = await new AddressBookQuery()
            .setFileId("0.0.102")
            .execute(client);

        expect(addressBook.nodeAddresses.length).to.be.above(0);
        client.close();
    });

    it("should be query the addressbook on mainnet", async function () {
        const client = Client.forMainnet();

        const addressBook = await new AddressBookQuery()
            .setFileId("0.0.102")
            .execute(client);

        expect(addressBook.nodeAddresses.length).to.be.above(0);
        client.close();
    });
});
