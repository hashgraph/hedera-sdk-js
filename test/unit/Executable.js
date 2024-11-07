import { RST_STREAM } from "../../src/Executable.js";

describe("Executable", function () {
    describe("RST_STREAM regex matching", function () {
        it("should match the actual response returned", function () {
            const errorMessage =
                "Error: 13 INTERNAL: Received RST_STREAM with code 0";
            expect(RST_STREAM.test(errorMessage)).to.be.true;
        });
    });
});