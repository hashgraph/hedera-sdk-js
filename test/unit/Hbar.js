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

    it("should pass regex and reverse [to|from]String", function () {
        let check = [
            "1 tℏ",
            "1 μℏ",
            "1 mℏ",
            "1 ℏ",
            "1 kℏ",
            "1 Mℏ",
            "1 Gℏ",
            "-1 tℏ",
            "-1 μℏ",
            "-1 mℏ",
            "-1 ℏ",
            "-1 kℏ",
            "-1 Mℏ",
            "-1 Gℏ",
            "1.151 tℏ",
            "1.151 μℏ",
            "1.151 mℏ",
            "1.151 ℏ",
            "1.151 kℏ",
            "1.151 Mℏ",
            "1.151 Gℏ",
            "-1.151 tℏ",
            "-1.151 μℏ",
            "-1.151 mℏ",
            "-1.151 ℏ",
            "-1.151 kℏ",
            "-1.151 Mℏ",
            "-1.151 Gℏ",
            "+1 Gℏ",
            "+1.151 Gℏ",
            "-1 Gℏ",
            "-1.151 Gℏ",
        ];

        for (let i = 0; i < check.length; i++) {
            expect(check[i]).to.equal(Hbar.fromString(check[i]).toString());
        }
    });

    it("should not pass regex", function () {
        let k = 0;
        let check = [
            "1 ",
            "-1 ",
            "+1 ",
            "1.151 ",
            "-1.151 ",
            "+1.151 ",
            "1.",
            "1.151.",
            ".1",
            "1.151 uℏ",
            "1.151 h",
        ];

        let i = check.length;

        for (let j = 0; j < check.length; j++) {
            try {
                Hbar.fromString(check[j]);
            } catch (error) {
                if (error.toString().includes("invalid argument provided")) {
                    k++;
                }
            }
        }
        expect(k).to.equal(i);
    });

    it("should append default unit Hbar", function () {
        /**
         * fromString strips + and should append the default Hbar unit when none are present
         */
        const unit = HbarUnit.Hbar._symbol;
        let check = [
            // "0",
            "1",
            "-1",
            "+1",
            "1.151",
            "-1.151",
            "+1.151",
        ];

        for (let i = 0; i < check.length; i++) {
            expect(check[i].replace("+", "") + " " + unit).to.equal(
                Hbar.fromString(check[i]).toString()
            );
        }
    });

    it("should convert various units to tinybar", function () {
        expect(Hbar.fromString("1").toTinybars().toString()).to.be.equal(
            "100000000"
        );
        expect(Hbar.fromString("1.151").toTinybars().toString()).to.be.equal(
            "115100000"
        );
        expect(Hbar.fromString("1 tℏ").toTinybars().toString()).to.be.equal(
            "1"
        );
        expect(Hbar.fromString("1 μℏ").toTinybars().toString()).to.be.equal(
            "100"
        );
        expect(Hbar.fromString("1 mℏ").toTinybars().toString()).to.be.equal(
            "100000"
        );
        expect(Hbar.fromString("1 ℏ").toTinybars().toString()).to.be.equal(
            "100000000"
        );
        expect(Hbar.fromString("1 kℏ").toTinybars().toString()).to.be.equal(
            "100000000000"
        );
        expect(Hbar.fromString("1 Mℏ").toTinybars().toString()).to.be.equal(
            "100000000000000"
        );
        expect(Hbar.fromString("1 Gℏ").toTinybars().toString()).to.be.equal(
            "100000000000000000"
        );
        expect(Hbar.fromString("1.151 mℏ").toTinybars().toString()).to.be.equal(
            "115100"
        );
        expect(Hbar.fromString("1.151 ℏ").toTinybars().toString()).to.be.equal(
            "115100000"
        );
        expect(Hbar.fromString("1.151 kℏ").toTinybars().toString()).to.be.equal(
            "115100000000"
        );
        expect(Hbar.fromString("1.151 Mℏ").toTinybars().toString()).to.be.equal(
            "115100000000000"
        );
        expect(Hbar.fromString("1.151 Gℏ").toTinybars().toString()).to.be.equal(
            "115100000000000000"
        );
        expect(Hbar.fromString("+1").toTinybars().toString()).to.be.equal(
            "100000000"
        );
        expect(Hbar.fromString("+1.151").toTinybars().toString()).to.be.equal(
            "115100000"
        );
        expect(Hbar.fromString("+1 Gℏ").toTinybars().toString()).to.be.equal(
            "100000000000000000"
        );
        expect(
            Hbar.fromString("+1.151 Gℏ").toTinybars().toString()
        ).to.be.equal("115100000000000000");
        expect(Hbar.fromString("-1").toTinybars().toString()).to.be.equal(
            "-100000000"
        );
        expect(Hbar.fromString("-1.151").toTinybars().toString()).to.be.equal(
            "-115100000"
        );
        expect(Hbar.fromString("-1 Gℏ").toTinybars().toString()).to.be.equal(
            "-100000000000000000"
        );
        expect(
            Hbar.fromString("-1.151 Gℏ").toTinybars().toString()
        ).to.be.equal("-115100000000000000");
    });

    it("should throw errors when converting to tinybars with decimals", function () {
        let check = [
        "1.151 tℏ",
        "1.151 μℏ",
    ];

        for (let i = 0; i < check.length; i++) {
            try {
                Hbar.fromString(check[i]);
            } catch (error) {
                expect(
                    error
                        .toString()
                        .includes("Hbar in tinybars contains decimals")
                ).to.equal(true);
            }
        }
    });
});
