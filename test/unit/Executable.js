import { RST_STREAM } from "../src/Executable.js";

describe("Executable", function () {
    it("RST_STREAM regex matches actual response returned", function () {
        expect(
            RST_STREAM.test(
                "Error: 13 INTERNAL: Received RST_STREAM with code 0"
            )
        ).to.be.true;
    });
});
