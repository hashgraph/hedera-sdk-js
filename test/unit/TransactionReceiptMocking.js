import { expect } from "chai";
import { TransactionReceiptQuery } from "../../src/index.js";
import Mocker from "./Mocker.js";

const TRANSACTION_RECEIPT_QUERY_RECEIPT_NOT_FOUND_RESPONSE = {
    transactionGetReceipt: {
        header: { nodeTransactionPrecheckCode: 18 },
    },
};

describe("TransactionReceiptMocking", function () {
    let client;
    let servers;

    afterEach(function () {
        client.close();
        servers.close();
    });

    it("should error with max attempts", async function () {
        this.timeout(10000);

        ({ client, servers } = await Mocker.withResponses([
            [
                {
                    response:
                        TRANSACTION_RECEIPT_QUERY_RECEIPT_NOT_FOUND_RESPONSE,
                },
                {
                    response:
                        TRANSACTION_RECEIPT_QUERY_RECEIPT_NOT_FOUND_RESPONSE,
                },
            ],
        ]));

        let err = false;

        try {
            await new TransactionReceiptQuery()
                .setTransactionId("0.0.3@4.5")
                .setMaxAttempts(2)
                .execute(client);
        } catch (error) {
            err = error
                .toString()
                .startsWith(
                    "Error: max attempts of 2 was reached for request with last error being"
                );
        }

        expect(err).to.be.true;
    });
});
