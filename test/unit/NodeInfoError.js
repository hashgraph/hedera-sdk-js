import { AccountId, NodeInfoError } from "../../src/index.js";

describe("NodeInfoError", function () {
    let message;
    let nodeAccountId;

    beforeEach(function () {
        message = "Test error message";
        nodeAccountId = new AccountId(3);
    });

    it("should create an instance with correct properties", () => {
        const error = new NodeInfoError(message, nodeAccountId);

        expect(error).to.be.instanceOf(NodeInfoError);
        expect(error.message).to.be.equal(message);
        expect(error.nodeAccountId).to.be.equal(nodeAccountId);
    });

    it("toJSON should return correct JSON representation", () => {
        const error = new NodeInfoError(message, nodeAccountId);
        const expectedJson = {
            message,
            nodeAccountId: nodeAccountId.toString(),
        };

        expect(error.toJSON()).to.be.deep.equal(expectedJson);
    });

    it("toString should return a JSON string", () => {
        const error = new NodeInfoError(message, nodeAccountId);
        const expectedString = JSON.stringify({
            message,
            nodeAccountId: nodeAccountId.toString(),
        });

        expect(error.toString()).to.be.equal(expectedString);
    });

    it("valueOf should return the same result as toJSON", () => {
        const error = new NodeInfoError(message, nodeAccountId);

        expect(error.valueOf()).to.be.deep.equal(error.toJSON());
    });
});
