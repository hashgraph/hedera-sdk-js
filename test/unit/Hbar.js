import Hbar from "../src/Hbar.js";
import HbarUnit from "../src/HbarUnit.js";

describe("Hbar", function () {
    it("should stringify to hbars", function () {
        expect(new Hbar(10).toString()).to.eql("10 ℏ");
    });

    it("should stringify to Microbar", function () {
        expect(
            Hbar.fromTinybars(1234567890).toString(HbarUnit.Microbar)
        ).to.eql("12345678.9 μℏ");
    });

    it("should make Hbar from string", function () {
        const hbars = Hbar.fromString(
            Hbar.fromTinybars(1234567890).toString(HbarUnit.Microbar)
        );
        expect(hbars.toString(HbarUnit.Microbar)).to.eql("12345678.9 μℏ");
        const hbars2 = Hbar.fromString(
            Hbar.from(1.12313, HbarUnit.Gigabar).toString(HbarUnit.Gigabar)
        );
        expect(hbars2.toString(HbarUnit.Millibar)).to.eql("1123130000000 mℏ");
        const hbars3 = Hbar.fromString(
            Hbar.from(1.12313, HbarUnit.Millibar).toString(HbarUnit.Hbar)
        );
        expect(hbars3.toString(HbarUnit.Hbar)).to.eql("0.00112313 ℏ");
        const hbars4 = Hbar.fromString(
            Hbar.from(1.12313, HbarUnit.Megabar).toString(HbarUnit.Megabar)
        );
        expect(hbars4.toString(HbarUnit.Hbar)).to.eql("1123130 ℏ");
    });

    it("should convert from hbars to tinybars", function () {
        const tinybar = "98327923153";
        const hbar = new Hbar("983.27923153");

        expect(tinybar).to.eql(hbar.toTinybars().toString());
    });
});
