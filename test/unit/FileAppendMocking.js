import { FileAppendTransaction } from "../../src/exports.js";
import Mocker from "./Mocker.js";
import { bigContents } from "../integration/contents.js";
import * as proto from "@hashgraph/proto";

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

const TRANSACTION_RECEIPT_FAILED_RESPONSE = {
    transactionGetReceipt: {
        header: {
            nodeTransactionPrecheckCode: proto.ResponseCodeEnum.OK,
        },
        receipt: {
            status: proto.ResponseCodeEnum.INVALID_FILE_ID,
        },
    },
};

describe("FileAppendMocking", function () {
    it("works", async function () {
        const { client, servers } = await Mocker.withResponses([
            [
                {
                    response: {
                        nodeTransactionPrecheckCode: proto.ResponseCodeEnum.OK,
                    },
                },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
                {
                    response: {
                        nodeTransactionPrecheckCode: proto.ResponseCodeEnum.OK,
                    },
                },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
                {
                    response: {
                        nodeTransactionPrecheckCode: proto.ResponseCodeEnum.OK,
                    },
                },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
                {
                    response: {
                        nodeTransactionPrecheckCode: proto.ResponseCodeEnum.OK,
                    },
                },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
                {
                    response: {
                        nodeTransactionPrecheckCode: proto.ResponseCodeEnum.OK,
                    },
                },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
                {
                    response: {
                        nodeTransactionPrecheckCode: proto.ResponseCodeEnum.OK,
                    },
                },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
                {
                    response: {
                        nodeTransactionPrecheckCode: proto.ResponseCodeEnum.OK,
                    },
                },
                { response: TRANSACTION_RECEIPT_SUCCESS_RESPONSE },
            ],
        ]);

        await new FileAppendTransaction()
            .setFileId("0.0.3")
            .setContents(bigContents)
            .execute(client);

        servers.close();
    });

    it("fails if any inner transaction fails", async function () {
        const { client, servers } = await Mocker.withResponses([
            [
                {
                    response: {
                        nodeTransactionPrecheckCode: proto.ResponseCodeEnum.OK,
                    },
                },
                { response: TRANSACTION_RECEIPT_FAILED_RESPONSE },
            ],
        ]);

        let err = false;

        try {
            await new FileAppendTransaction()
                .setFileId("0.0.3")
                .setContents(bigContents)
                .execute(client);
        } catch (error) {
            err = error.toString().includes("INVALID_FILE_ID");
        }

        if (!err) {
            throw new Error("did not error");
        }

        servers.close();
    });
});
