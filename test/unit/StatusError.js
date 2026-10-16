import {
    AccountId,
    PrecheckStatusError,
    ReceiptStatusError,
    Status,
    StatusError,
    TransactionId,
    TransactionReceipt,
} from "../../src/index.js";

describe("StatusError", function () {
    const transactionId = TransactionId.fromString(
        "0.0.1001@1700000000.000000001",
    );
    const status = Status.InvalidSignature;
    const message = "test error message";

    it("should store status, transactionId and message from constructor", function () {
        const error = new StatusError({ status, transactionId }, message);

        expect(error.status).toBe(status);
        expect(error.transactionId).toBe(transactionId);
        expect(error.message).toBe(message);
    });

    it("should have name 'StatusError'", function () {
        const error = new StatusError({ status, transactionId }, message);

        expect(error.name).toBe("StatusError");
    });

    it("should be an instance of Error", function () {
        const error = new StatusError({ status, transactionId }, message);

        expect(error).toBeInstanceOf(Error);
    });

    it("toJSON() should return name, status, transactionId as strings, plus message", function () {
        const error = new StatusError({ status, transactionId }, message);

        const json = error.toJSON();

        expect(json).toEqual({
            name: "StatusError",
            status: status.toString(),
            transactionId: transactionId.toString(),
            message: message,
        });
    });

    it("toString() should return JSON.stringify(error.toJSON())", function () {
        const error = new StatusError({ status, transactionId }, message);

        const expectedString = JSON.stringify(error.toJSON());

        expect(error.toString()).toBe(expectedString);
    });

    it("valueOf() should return the same object as toJSON()", function () {
        const error = new StatusError({ status, transactionId }, message);

        const valueOfResult = error.valueOf();
        const toJSONResult = error.toJSON();

        expect(valueOfResult).toEqual(toJSONResult);
    });
});

describe("PrecheckStatusError", function () {
    const transactionId = TransactionId.fromString(
        "0.0.1001@1700000000.000000001",
    );
    const status = Status.InvalidSignature;
    const nodeId = AccountId.fromString("0.0.3");
    const contractFunctionResult = null;

    it("should construct message in the correct format", function () {
        const error = new PrecheckStatusError({
            status,
            transactionId,
            nodeId,
            contractFunctionResult,
        });

        const expectedMessage = `transaction ${transactionId.toString()} failed precheck with status ${status.toString()} against node account id ${nodeId.toString()}`;

        expect(error.message).toBe(expectedMessage);
    });

    it("should store nodeId", function () {
        const error = new PrecheckStatusError({
            status,
            transactionId,
            nodeId,
            contractFunctionResult,
        });

        expect(error.nodeId).toBe(nodeId);
    });

    it("should store contractFunctionResult", function () {
        const error = new PrecheckStatusError({
            status,
            transactionId,
            nodeId,
            contractFunctionResult,
        });

        expect(error.contractFunctionResult).toBe(contractFunctionResult);
    });

    it("toJSON() should contain nodeId as string and contractFunctionResult", function () {
        const error = new PrecheckStatusError({
            status,
            transactionId,
            nodeId,
            contractFunctionResult,
        });

        const json = error.toJSON();

        expect(json.nodeId).toBe(nodeId.toString());
        expect(json.contractFunctionResult).toBe(contractFunctionResult);
        expect(json).toMatchObject({
            name: "StatusError",
            status: status.toString(),
            transactionId: transactionId.toString(),
            nodeId: nodeId.toString(),
            message: error.message,
            contractFunctionResult: contractFunctionResult,
        });
    });

    it("should be an instance of StatusError", function () {
        const error = new PrecheckStatusError({
            status,
            transactionId,
            nodeId,
            contractFunctionResult,
        });

        expect(error).toBeInstanceOf(StatusError);
    });

    it("should have name 'StatusError'", function () {
        const error = new PrecheckStatusError({
            status,
            transactionId,
            nodeId,
            contractFunctionResult,
        });

        expect(error.name).toBe("StatusError");
    });
});

describe("ReceiptStatusError", function () {
    const transactionId = TransactionId.fromString(
        "0.0.1001@1700000000.000000001",
    );
    const status = Status.InvalidSignature;
    const transactionReceipt = TransactionReceipt._fromProtobuf({
        receipt: { status: Status.InvalidSignature._code },
    });

    it("should construct message in the correct format", function () {
        const error = new ReceiptStatusError({
            status,
            transactionId,
            transactionReceipt,
        });

        const expectedMessage = `receipt for transaction ${transactionId.toString()} contained error status ${status.toString()}`;

        expect(error.message).toBe(expectedMessage);
    });

    it("should store transactionReceipt", function () {
        const error = new ReceiptStatusError({
            status,
            transactionId,
            transactionReceipt,
        });

        expect(error.transactionReceipt).toBe(transactionReceipt);
    });

    it("toJSON() should be inherited from StatusError and not contain receipt", function () {
        const error = new ReceiptStatusError({
            status,
            transactionId,
            transactionReceipt,
        });

        const json = error.toJSON();

        expect(json).toEqual({
            name: "StatusError",
            status: status.toString(),
            transactionId: transactionId.toString(),
            message: error.message,
        });
        expect(json).not.toHaveProperty("transactionReceipt");
    });

    it("should be an instance of StatusError", function () {
        const error = new ReceiptStatusError({
            status,
            transactionId,
            transactionReceipt,
        });

        expect(error).toBeInstanceOf(StatusError);
    });

    it("should have name 'StatusError'", function () {
        const error = new ReceiptStatusError({
            status,
            transactionId,
            transactionReceipt,
        });

        expect(error.name).toBe("StatusError");
    });
});
