import Hbar from "../src/Hbar.js";
import HbarUnit from "../src/HbarUnit.js";

describe("Hbar", function () {
    it("should pass regex, convert, and reverse [to|from]String", function () {
        let check = [
            ["0 ℏ", "0 tℏ"],
            ["1 tℏ", "1 tℏ"],
            ["1 μℏ", "100 tℏ"],
            ["1 mℏ", "0.001 ℏ"],
            ["1 ℏ", "1 ℏ"],
            ["1 kℏ", "1000 ℏ"],
            ["1 Mℏ", "1000000 ℏ"],
            ["1 Gℏ", "1000000000 ℏ"],
            ["+0 ℏ", "0 tℏ"],
            ["+1 tℏ", "1 tℏ"],
            ["+1 μℏ", "100 tℏ"],
            ["+1 mℏ", "0.001 ℏ"],
            ["+1 ℏ", "1 ℏ"],
            ["+1 kℏ", "1000 ℏ"],
            ["+1 Mℏ", "1000000 ℏ"],
            ["+1 Gℏ", "1000000000 ℏ"],
            ["-0 ℏ", "0 tℏ"],
            ["-1 tℏ", "-1 tℏ"],
            ["-1 μℏ", "-100 tℏ"],
            ["-1 mℏ", "-0.001 ℏ"],
            ["-1 ℏ", "-1 ℏ"],
            ["-1 kℏ", "-1000 ℏ"],
            ["-1 Mℏ", "-1000000 ℏ"],
            ["-1 Gℏ", "-1000000000 ℏ"],
        ];

        for (let i = 0; i < check.length; i++) {
            expect(check[i][1]).to.equal(
                Hbar.fromString(check[i][0]).toString()
            );
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
        let check = ["1", "-1", "+1", "1.151", "-1.151", "+1.151"];

        for (let i = 0; i < check.length; i++) {
            expect(check[i].replace("+", "") + " " + unit).to.equal(
                Hbar.fromString(check[i]).toString()
            );
        }
    });

    it("should pass regex, convert to tinybar, and reverse [to|from]String", function () {
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

    it('should throw error "Hbar in tinybars contains decimals"', function () {
        let check = ["1.151 tℏ", "1.151 μℏ", "1.151", "-1.151", "+1.151"];

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
