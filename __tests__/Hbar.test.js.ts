import { Hbar, HbarUnit, hbarUnits, tinybarConversions } from "../src/Hbar";
import BigNumber from "bignumber.js";

describe("Hbar", () => {
    const fiftyGTinybar = new BigNumber(5_000_000_000);
    const fiftyHbar = Hbar.fromTinybar(fiftyGTinybar); // 50 hbar

    const negativeFiftyGTinybar = new BigNumber(-5_000_000_000);
    const negativeFiftyHbar = Hbar.fromTinybar(negativeFiftyGTinybar); // -50 hbar

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

        expect(fiftyHbar.plus(negativeFiftyHbar)).toStrictEqual(zeroHbar);

        expect(fiftyHbar.minus(fiftyHbar)).toStrictEqual(zeroHbar);
        expect(fiftyHbar.minus(fiftyGTinybar, "tinybar")).toStrictEqual(zeroHbar);

        expect(fiftyHbar.minus(negativeFiftyHbar)).toStrictEqual(hundredHbar);

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
        expect(fiftyHbar.isEqualTo(negativeFiftyHbar)).toBe(false);

        expect(fiftyHbar.isGreaterThan(hundredHbar)).toBe(false);
        expect(fiftyHbar.isGreaterThan(negativeFiftyHbar)).toBe(true);
        expect(fiftyHbar.isGreaterThan(10, 'hbar')).toBe(true);
        expect(fiftyHbar.isGreaterThan(negativeFiftyGTinybar, 'tinybar')).toBe(true);
        expect(fiftyHbar.isGreaterThan(fiftyHbar)).toBe(false);

        expect(fiftyHbar.isGreaterThanOrEqualTo(hundredHbar)).toBe(false);
        expect(fiftyHbar.isGreaterThanOrEqualTo(negativeFiftyHbar)).toBe(true);
        expect(fiftyHbar.isGreaterThanOrEqualTo(10, 'hbar')).toBe(true);
        expect(fiftyHbar.isGreaterThanOrEqualTo(negativeFiftyGTinybar, 'tinybar')).toBe(true);
        expect(fiftyHbar.isGreaterThanOrEqualTo(fiftyHbar)).toBe(true);

        expect(fiftyHbar.isLessThan(hundredHbar)).toBe(true);
        expect(fiftyHbar.isLessThan(negativeFiftyHbar)).toBe(false);
        expect(fiftyHbar.isLessThan(10, 'hbar')).toBe(false);
        expect(fiftyHbar.isLessThan(negativeFiftyGTinybar, 'tinybar')).toBe(false);
        expect(fiftyHbar.isLessThan(fiftyHbar)).toBe(false);

        expect(fiftyHbar.isLessThanOrEqualTo(hundredHbar)).toBe(true);
        expect(fiftyHbar.isLessThanOrEqualTo(negativeFiftyHbar)).toBe(false);
        expect(fiftyHbar.isLessThanOrEqualTo(10, 'hbar')).toBe(false);
        expect(fiftyHbar.isLessThanOrEqualTo(negativeFiftyGTinybar, 'tinybar')).toBe(false);
        expect(fiftyHbar.isLessThanOrEqualTo(fiftyHbar)).toBe(true);

        expect(fiftyHbar.comparedTo(fiftyHbar)).toStrictEqual(0);
        expect(fiftyHbar.comparedTo(hundredHbar)).toStrictEqual(-1);
        expect(fiftyHbar.comparedTo(zeroHbar)).toStrictEqual(1);

        expect(fiftyHbar.comparedTo(50, "hbar")).toStrictEqual(0);

        expect(zeroHbar.isZero()).toBe(true);

        expect(fiftyHbar.isPositive()).toBe(true);
        expect(fiftyHbar.isNegative()).toBe(false);
        expect(fiftyHbar.isZero()).toBe(false);

        expect(negativeFiftyHbar.isPositive()).toBe(false);
        expect(negativeFiftyHbar.isNegative()).toBe(true);
        expect(negativeFiftyHbar.isZero()).toBe(false);

    });

    it("hbarUnits matches tinyBarConversions", () => {
        expect([ ...hbarUnits ].sort()).toStrictEqual(Object.keys(tinybarConversions).sort());
    });
});
