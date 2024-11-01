import { RST_STREAM } from "../../src/Executable.js";
import { TransferTransaction, Hbar, AccountId } from "../../src/index.js";
import Mocker from "./Mocker.js";

describe("Executable", function () {
    describe("RST_STREAM regex matching", function () {
        it("should match the actual response returned", function () {
            const errorMessage =
                "Error: 13 INTERNAL: Received RST_STREAM with code 0";
            expect(RST_STREAM.test(errorMessage)).to.be.true;
        });
    });

    describe("Transaction execution errors", function () {
        let client, transaction;

        beforeEach(async function () {
            const setup = await Mocker.withResponses([]);
            client = setup.client;
            transaction = new TransferTransaction()
                .addHbarTransfer("0.0.2", new Hbar(1))
                .setNodeAccountIds([new AccountId(5)]);
        });

        it("should throw a timeout error when the timeout exceeds", async function () {
            // Set the client's request timeout to 0 for testing
            client.setRequestTimeout(0);
            transaction = transaction.freezeWith(client);

            try {
                await transaction.execute(client);
                throw new Error("Expected request to time out but it didn't.");
            } catch (error) {
                expect(error.message).to.include("timeout exceeded");
                expect(error.nodeAccountId.toString()).to.equal("0.0.5");
            }
        });

        it("should throw a max attempts error when max attempts is reached", async function () {
            // Set the transaction's max attempts to 0 for testing
            transaction = transaction.setMaxAttempts(0).freezeWith(client);

            try {
                await transaction.execute(client);
                throw new Error(
                    "Expected request to fail due to max attempts being reached.",
                );
            } catch (error) {
                expect(error.message).to.include(
                    "max attempts of 0 was reached for request with last error being:",
                );
                expect(error.nodeAccountId.toString()).to.equal("0.0.5");
            }
        });
    });
});
