import { expect } from "chai";
import {
    ContractCreateFlow,
    Transaction,
    PrivateKey,
} from "../../src/index.js";
import Mocker, { TRANSACTION_RECEIPT_SUCCESS_RESPONSE } from "./Mocker.js";
import { proto } from "@hashgraph/proto";
import { bigContents } from "../integration/contents.js";

describe("ContractCreateFlowMocking", function () {
    let client;
    let servers;

    afterEach(function () {
        client.close();
        servers.close();
    });

    it("signs all transactions", async function () {
        this.timeout(10000);

        const key = PrivateKey.generate();

        const verifyTransactionCall = (request) => {
            const transaction = Transaction.fromBytes(
                proto.Transaction.encode({
                    signedTransactionBytes: request.signedTransactionBytes,
                }).finish()
            );

            expect(key.publicKey.verifyTransaction(transaction)).to.be.true;

            return { nodeTransactionPrecheckCode: proto.ResponseCodeEnum.OK };
        };

        ({ client, servers } = await Mocker.withResponses([
            [
                { call: verifyTransactionCall },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
                { call: verifyTransactionCall },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
                { call: verifyTransactionCall },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
                { call: verifyTransactionCall },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
                { call: verifyTransactionCall },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
                { call: verifyTransactionCall },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
                { call: verifyTransactionCall },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
                { call: verifyTransactionCall },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
                { call: verifyTransactionCall },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
                { call: verifyTransactionCall },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
            ],
        ]));

        await new ContractCreateFlow()
            .setBytecode(bigContents)
            .sign(key)
            .execute(client);
    });
});
