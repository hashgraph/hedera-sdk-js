import { expect } from "chai";

import * as hex from "../../src/encoding/hex.js";
import * as rlp from "@ethersproject/rlp";
import { proto } from "@hashgraph/proto";
import Mocker from "./Mocker.js";
import { EthereumFlow, FileId } from "../../src/index.js";

const TRANSACTION_RECEIPT_SUCCESS_RESPONSE = {
    transactionGetReceipt: {
        header: {
            nodeTransactionPrecheckCode: proto.ResponseCodeEnum.OK,
        },
        receipt: {
            status: proto.ResponseCodeEnum.SUCCESS,
        },
    },
};

const TRANSACTION_RESPONSE_SUCCESS = {
    nodeTransactionPrecheckCode: proto.ResponseCodeEnum.OK,
};

const bytes = hex.decode(
    "f864012f83018000947e3a9eaf9bcc39e2ffa38eb30bf7a93feacbc18180827653820277a0f9fbff985d374be4a55f296915002eec11ac96f1ce2df183adf992baa9390b2fa00c1e867cc960d9c74ec2e6a662b7908ec4c8cc9f3091e886bcefbeb2290fb792"
);

const callData = FileId.fromString("0.0.1");

describe("EthereumFlowMocking", function () {
    let client;
    let servers;

    afterEach(function () {
        client.close();
        servers.close();
    });

    it("doesn't truncate ethereum data if it's not long enough", async function () {
        this.timeout(10000);

        ({ client, servers } = await Mocker.withResponses([
            [
                {
                    call: (request) => {
                        const transactionBody = proto.TransactionBody.decode(
                            proto.SignedTransaction.decode(
                                request.signedTransactionBytes
                            ).bodyBytes
                        );

                        expect(
                            transactionBody.ethereumTransaction.ethereumData
                        ).to.deep.equal(bytes);

                        return { response: TRANSACTION_RESPONSE_SUCCESS };
                    },
                },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
            ],
        ]));

        await (
            await new EthereumFlow().setEthereumData(bytes).execute(client)
        ).getReceipt(client);
    });

    it("errors if ethereum data is not provided", async function () {
        this.timeout(10000);

        ({ client, servers } = await Mocker.withResponses([
            [
                {
                    call: (request) => {
                        const transactionBody = proto.TransactionBody.decode(
                            proto.SignedTransaction.decode(
                                request.signedTransactionBytes
                            ).bodyBytes
                        );

                        expect(
                            transactionBody.ethereumTransaction.ethereumData
                        ).to.deep.equal(bytes);

                        return { response: TRANSACTION_RESPONSE_SUCCESS };
                    },
                },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
            ],
        ]));

        try {
            await new EthereumFlow().execute(client)
        } catch (error) {
            if (
                !error.message.startsWith(
                    "cannot submit ethereum transaction with no ethereum data"
                )
            ) {
                throw error;
            }
        }
    });

    it("extracts the calldata if it's too large", async function () {
        this.timeout(10000);

        const decoded = rlp.decode(bytes);
        const longCallData = "0x" + "00".repeat(5121);
        decoded[5] = longCallData;
        const encoded = hex.decode(rlp.encode(decoded));
        decoded[5] = "0x";
        const encodedWithoutCallData = hex.decode(rlp.encode(decoded));

        ({ client, servers } = await Mocker.withResponses([
            [
                {
                    call: (request) => {
                        const transactionBody = proto.TransactionBody.decode(
                            proto.SignedTransaction.decode(
                                request.signedTransactionBytes
                            ).bodyBytes
                        );

                        const fileCreate = transactionBody.fileCreate;
                        expect(fileCreate.contents).to.deep.equal(
                            hex.decode(longCallData).subarray(0, 4096)
                        );

                        return { response: TRANSACTION_RESPONSE_SUCCESS };
                    },
                },
                {
                    response: {
                        transactionGetReceipt: {
                            header: {
                                nodeTransactionPrecheckCode:
                                    proto.ResponseCodeEnum.OK,
                            },
                            receipt: {
                                status: proto.ResponseCodeEnum.SUCCESS,
                                fileID: callData._toProtobuf(),
                            },
                        },
                    },
                },
                {
                    call: (request) => {
                        const transactionBody = proto.TransactionBody.decode(
                            proto.SignedTransaction.decode(
                                request.signedTransactionBytes
                            ).bodyBytes
                        );

                        const fileAppend = transactionBody.fileAppend;
                        expect(fileAppend.contents).to.deep.equal(
                            hex.decode(longCallData).subarray(4096)
                        );

                        return { response: TRANSACTION_RESPONSE_SUCCESS };
                    },
                },
                // Yes, you need 2 receipt responses here. One happens in
                // `FileAppendTransaction.executeAll()` in a loop, and the next
                // is for `TransactionResponse.getReceipt()`
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
                {
                    call: (request) => {
                        const transactionBody = proto.TransactionBody.decode(
                            proto.SignedTransaction.decode(
                                request.signedTransactionBytes
                            ).bodyBytes
                        );

                        const ethereumTransaction =
                            transactionBody.ethereumTransaction;
                        expect(ethereumTransaction.ethereumData).to.deep.equal(
                            encodedWithoutCallData
                        );
                        expect(ethereumTransaction.callData).to.deep.equal(
                            callData._toProtobuf()
                        );

                        return { response: TRANSACTION_RESPONSE_SUCCESS };
                    },
                },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
            ],
        ]));

        await (
            await new EthereumFlow().setEthereumData(encoded).execute(client)
        ).getReceipt(client);
    });
});
