import { Hbar, HbarUnit, hbarUnits, tinybarConversions } from "../src/Hbar";
import BigNumber from "bignumber.js";

describe("Hbar", () => {
    const fiftyGTinybar = new BigNumber(5_000_000_000);
    const fiftyHbar = Hbar.fromTinybar(fiftyGTinybar); // 50 hbar

    const hundredHbar = Hbar.from(new BigNumber(10_000_000_000), "tinybar");
    const zeroHbar = Hbar.from(0, "tinybar");

    it("factory method checks", () => {
        expect(fiftyHbar.asTinybar()).toStrictEqual(fiftyGTinybar);
        expect(fiftyHbar.value()).toStrictEqual(new BigNumber(50));

        expect(Hbar.of("50").asTinybar()).toStrictEqual(fiftyGTinybar);
        expect(Hbar.fromTinybar("5000000000").asTinybar()).toStrictEqual(fiftyGTinybar);
    });

    it.each([[ 50_000_000, "microbar" ], [ "50000000", "microbar" ], [ 50_000, "millibar" ], [ "50000", "millibar" ], [ 50, "hbar" ], [ "50", "hbar" ], [ 0.05, "kilobar" ], [ "0.05", "kilobar" ], [ 0.00005, "megabar" ], [ "0.00005", "megabar" ], [ 0.00000005, "gigabar" ], [ "0.00000005", "gigabar" ]] as [number, HbarUnit][])(
        "value conversions are correct/50 hbar",
        (amount, unit) => {
            expect(Hbar.from(amount, unit))
                .toStrictEqual(fiftyHbar);

            expect(fiftyHbar.as(unit)).toStrictEqual(new BigNumber(amount));
        }
    );

    it("arithmetic works correctly", () => {
        expect(fiftyHbar.plus(fiftyHbar)).toStrictEqual(hundredHbar);
        expect(fiftyHbar.plus(fiftyGTinybar, "tinybar")).toStrictEqual(hundredHbar);

        expect(fiftyHbar.minus(fiftyHbar)).toStrictEqual(zeroHbar);
        expect(fiftyHbar.minus(fiftyGTinybar, "tinybar")).toStrictEqual(zeroHbar);

        expect(fiftyHbar.negated().asTinybar()).toStrictEqual(fiftyGTinybar.negated());
        expect(fiftyHbar.negated().isNegative()).toBe(true);
    });

    it("comparison works correctly", () => {
        expect(fiftyHbar.isEqualTo(fiftyHbar)).toBe(true);
        expect(fiftyHbar.isEqualTo(fiftyGTinybar, "tinybar")).toBe(true);
        expect(fiftyHbar.isEqualTo(50, "hbar")).toBe(true);

        expect(fiftyHbar.isEqualTo(hundredHbar)).toBe(false);
        expect(fiftyHbar.isEqualTo(zeroHbar)).toBe(false);
        expect(fiftyHbar.isEqualTo(100, "hbar")).toBe(false);
        expect(fiftyHbar.isEqualTo(500, "hbar")).toBe(false);

        expect(fiftyHbar.comparedTo(fiftyHbar)).toStrictEqual(0);
        expect(fiftyHbar.comparedTo(hundredHbar)).toStrictEqual(-1);
        expect(fiftyHbar.comparedTo(zeroHbar)).toStrictEqual(1);
    });

    it("hbarUnits matches tinyBarConversions", () => {
        expect([ ...hbarUnits ].sort()).toStrictEqual(Object.keys(tinybarConversions).sort());
    });
});
