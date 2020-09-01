import Hbar from "../src/Hbar.js";

describe("Hbar", function () {
    it("should stringify to hbars", function () {
        expect(new Hbar(10).toString()).to.eql("10 ℏ");
    });
});
