import {
    Timestamp,
    FreezeTransaction,
    FreezeType,
    // TransactionResponse,
    // TransactionReceipt,
    Status,
} from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("FreezeTransaction", function () {
    let client;

    before(async function () {
        const env = await IntegrationTestEnv.new();
        client = env.client;
    });

    it("should be executable but not supported", async function () {
        this.timeout(120000);
        const seconds = Math.round(Date.now() / 1000);
        const validStart = new Timestamp(seconds, 0);

        const transaction = new FreezeTransaction()
            .setStartTimestamp(validStart)
            .setFreezeType(new FreezeType(1))
            .freezeWith(client);
        expect(transaction.startTimestamp).to.be.equal(validStart);
        expect(transaction.freezeType).to.be.instanceof(FreezeType);

        try {
            await transaction.execute(client);
        } catch (error) {
            expect(error.status).to.be.equal(Status.NotSupported);
        }

        // At the moment the API is not supported that's why the following lines are commented out.
        // Once supported the try/catch block above should be removed.
        // The status from execution of the transaction is code 13 which means NOT_SUPPORTED.

        // const response = await transaction.execute(client)
        // expect(response).to.be.instanceof(TransactionResponse)
        // const receipt = await response.getReceipt(client)
        // expect(receipt).to.be.instanceof(TransactionReceipt)
        // expect(receipt.status.toString).to.be.instanceof(Status.Success)

        client.close();
    });
});
