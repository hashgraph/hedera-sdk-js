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

    it("should convert from hbars to tinybars", function () {
        const tinybar = "98327923153";
        const hbar = new Hbar("983.27923153");

        expect(tinybar).to.eql(hbar.toTinybars().toString());
    });

    it("should reverse Hbar units using [to|from]String()", function () {
        let hbar = new Hbar("100.00", HbarUnit.Hbar);
        let toString = String;
        let fromString = String;

        toString = hbar.toString();
        fromString = Hbar.fromString(toString).toString();
        expect(toString).to.eql(fromString);
    });

    it("should reverse Tinybar units using [to|from]String()", function () {
        let tinybar = new Hbar("100.00", HbarUnit.Tinybar);
        let toString = String;
        let fromString = String;

        toString = tinybar.toString();
        fromString = Hbar.fromString(toString).toString();
        expect(toString).to.eql(fromString);
    });

    it("should reverse Microbar units using [to|from]String()", function () {
        let microbar = new Hbar("100.00", HbarUnit.Microbar);
        let toString = String;
        let fromString = String;

        toString = microbar.toString();
        fromString = Hbar.fromString(toString).toString();
        expect(toString).to.eql(fromString);
    });

    it("should reverse Millibar units using [to|from]String()", function () {
        let millibar = new Hbar("100.00", HbarUnit.Millibar);
        let toString = String;
        let fromString = String;

        toString = millibar.toString();
        fromString = Hbar.fromString(toString).toString();
        expect(toString).to.eql(fromString);
    });

    it("should reverse Kilobar units using [to|from]String()", function () {
        let kilobar = new Hbar("100.00", HbarUnit.Kilobar);
        let toString = String;
        let fromString = String;

        toString = kilobar.toString();
        fromString = Hbar.fromString(toString).toString();
        expect(toString).to.eql(fromString);
    });

    it("should reverse Megabar units using [to|from]String()", function () {
        let megabar = new Hbar("100.00", HbarUnit.Megabar);
        let toString = String;
        let fromString = String;

        toString = megabar.toString();
        fromString = Hbar.fromString(toString).toString();
        expect(toString).to.eql(fromString);
    });

    it("should reverse Gigabar units using [to|from]String()", function () {
        let gigabar = new Hbar("100.00", HbarUnit.Gigabar);
        let toString = String;
        let fromString = String;

        toString = gigabar.toString();
        fromString = Hbar.fromString(toString).toString();
        expect(toString).to.eql(fromString);
    });
});
