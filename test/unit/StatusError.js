import { StatusError, Status, TransactionId } from "../../src/exports.js";

describe("StatusError", function () {
    it("[to|from]JSON()", function () {
        const error = new StatusError(
            {
                status: Status.Busy,
                transactionId: TransactionId.fromString("0.0.1@2.3"),
            },
            "random message"
        );

        expect(StatusError.fromJSON(error.toJSON()).toJSON()).to.deep.equal(
            error.toJSON()
        );
    });

    it("fromJSON fails when all fields are present, but set to invalid values", function () {
        const error = new StatusError(
            {
                status: "random string",
                transactionId: TransactionId.fromString("0.0.1@2.3"),
            },
            "random message"
        );

        expect(() => StatusError.fromJSON(error.toJSON()).toJSON()).to.throw();
    });
});
