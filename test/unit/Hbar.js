import Hbar from "../src/Hbar";

describe("Hbar", function () {
    it("should stringify to hbars", function () {
        expect(new Hbar(10).toString()).to.eql("10 ℏ");
    });

    it("should convert from hbars to tinybars", function () {
        const tinybar = "98327923153";
        const hbar = new Hbar("983.27923153");

        expect(tinybar).to.eql(hbar.toTinybars().toString());
    });
});
