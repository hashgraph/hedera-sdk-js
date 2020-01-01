import { Hbar, HbarUnit } from "../src/Hbar";
import BigNumber from "bignumber.js";

describe("hbar", () => {
    const fiftyGTinybar = new BigNumber(5_000_000_000);
    const fiftyHbar = Hbar.fromTinybar(fiftyGTinybar); // 50 hbar

    const negativeFiftyGTinybar = new BigNumber(-5_000_000_000);
    const negativeFiftyHbar = Hbar.fromTinybar(negativeFiftyGTinybar); // -50 hbar

    const hundredHbar = Hbar.from(new BigNumber(10_000_000_000), HbarUnit.Tinybar);

    const zeroTinyBar = new BigNumber(0);
    const zeroHbar = Hbar.zero();
    const negativeZeroHbar = Hbar.from(-0, HbarUnit.Tinybar);

    it("factory method checks", () => {
        expect(fiftyHbar.asTinybar()).toStrictEqual(fiftyGTinybar);
        expect(fiftyHbar.value()).toStrictEqual(new BigNumber(50));

        expect(Hbar.of("50").asTinybar()).toStrictEqual(fiftyGTinybar);
        expect(Hbar.fromTinybar("5000000000").asTinybar()).toStrictEqual(fiftyGTinybar);
        expect(Hbar.zero().asTinybar()).toStrictEqual(zeroTinyBar);
    });

    it.each([[ 50_000_000, HbarUnit.Microbar ], [ "50000000", HbarUnit.Microbar ], [ 50_000, HbarUnit.Millibar ], [ "50000", HbarUnit.Millibar ], [ 50, HbarUnit.Hbar ], [ "50", HbarUnit.Hbar ], [ 0.05, HbarUnit.Kilobar ], [ "0.05", HbarUnit.Kilobar ], [ 0.00005, HbarUnit.Megabar ], [ "0.00005", HbarUnit.Megabar ], [ 0.00000005, HbarUnit.Gigabar ], [ "0.00000005", HbarUnit.Gigabar ]] as [number, HbarUnit][])(
        "value conversions are correct/50 hbar",
        (amount, unit) => {
            expect(Hbar.from(amount, unit)).toStrictEqual(fiftyHbar);

            expect(fiftyHbar.as(unit)).toStrictEqual(new BigNumber(amount));
        }
    );

    it("arithmetic works correctly", () => {
        expect(fiftyHbar.plus(fiftyHbar)).toStrictEqual(hundredHbar);
        expect(fiftyHbar.plus(fiftyGTinybar, HbarUnit.Tinybar)).toStrictEqual(hundredHbar);
        expect(fiftyHbar.plus(negativeFiftyHbar)).toStrictEqual(zeroHbar);
        expect(fiftyHbar.plus(zeroHbar)).toStrictEqual(fiftyHbar);
        expect(fiftyHbar.plus(negativeZeroHbar)).toStrictEqual(fiftyHbar);

        expect(fiftyHbar.minus(fiftyHbar)).toStrictEqual(zeroHbar);
        expect(fiftyHbar.minus(fiftyGTinybar, HbarUnit.Tinybar)).toStrictEqual(zeroHbar);
        expect(fiftyHbar.minus(negativeFiftyHbar)).toStrictEqual(hundredHbar);
        expect(fiftyHbar.minus(zeroHbar)).toStrictEqual(fiftyHbar);
        expect(fiftyHbar.minus(negativeZeroHbar)).toStrictEqual(fiftyHbar);

        expect(zeroHbar.minus(fiftyHbar)).toStrictEqual(negativeFiftyHbar);
        expect(negativeZeroHbar.minus(fiftyHbar)).toStrictEqual(negativeFiftyHbar);

        expect(fiftyHbar.negated().asTinybar()).toStrictEqual(fiftyGTinybar.negated());
        expect(fiftyHbar.negated().isNegative()).toBe(true);
    });

    it("comparison works correctly", () => {
        expect(zeroHbar.isEqualTo(Hbar.ZERO)).toBe(true);
        expect(negativeZeroHbar.isEqualTo(Hbar.ZERO)).toBe(true);
        expect(zeroHbar.isEqualTo(negativeZeroHbar)).toBe(true);
        expect(fiftyHbar.isEqualTo(fiftyHbar)).toBe(true);
        expect(fiftyHbar.isEqualTo(fiftyGTinybar, HbarUnit.Tinybar)).toBe(true);
        expect(fiftyHbar.isEqualTo(50, HbarUnit.Hbar)).toBe(true);

        expect(fiftyHbar.isEqualTo(hundredHbar)).toBe(false);
        expect(fiftyHbar.isEqualTo(zeroHbar)).toBe(false);
        expect(fiftyHbar.isEqualTo(100, HbarUnit.Hbar)).toBe(false);
        expect(fiftyHbar.isEqualTo(500, HbarUnit.Hbar)).toBe(false);
        expect(fiftyHbar.isEqualTo(negativeFiftyHbar)).toBe(false);

        expect(fiftyHbar.isGreaterThan(hundredHbar)).toBe(false);
        expect(fiftyHbar.isGreaterThan(negativeFiftyHbar)).toBe(true);
        expect(fiftyHbar.isGreaterThan(10, HbarUnit.Hbar)).toBe(true);
        expect(fiftyHbar.isGreaterThan(negativeFiftyGTinybar, HbarUnit.Tinybar)).toBe(true);
        expect(fiftyHbar.isGreaterThan(fiftyHbar)).toBe(false);

        expect(fiftyHbar.isGreaterThanOrEqualTo(hundredHbar)).toBe(false);
        expect(fiftyHbar.isGreaterThanOrEqualTo(negativeFiftyHbar)).toBe(true);
        expect(fiftyHbar.isGreaterThanOrEqualTo(10, HbarUnit.Hbar)).toBe(true);
        expect(fiftyHbar.isGreaterThanOrEqualTo(negativeFiftyGTinybar, HbarUnit.Tinybar)).toBe(true);
        expect(fiftyHbar.isGreaterThanOrEqualTo(fiftyHbar)).toBe(true);

        expect(fiftyHbar.isLessThan(hundredHbar)).toBe(true);
        expect(fiftyHbar.isLessThan(negativeFiftyHbar)).toBe(false);
        expect(fiftyHbar.isLessThan(10, HbarUnit.Hbar)).toBe(false);
        expect(fiftyHbar.isLessThan(negativeFiftyGTinybar, HbarUnit.Tinybar)).toBe(false);
        expect(fiftyHbar.isLessThan(fiftyHbar)).toBe(false);

        expect(fiftyHbar.isLessThanOrEqualTo(hundredHbar)).toBe(true);
        expect(fiftyHbar.isLessThanOrEqualTo(negativeFiftyHbar)).toBe(false);
        expect(fiftyHbar.isLessThanOrEqualTo(10, HbarUnit.Hbar)).toBe(false);
        expect(fiftyHbar.isLessThanOrEqualTo(negativeFiftyGTinybar, HbarUnit.Tinybar)).toBe(false);
        expect(fiftyHbar.isLessThanOrEqualTo(fiftyHbar)).toBe(true);

        expect(fiftyHbar.comparedTo(fiftyHbar)).toStrictEqual(0);
        expect(fiftyHbar.comparedTo(hundredHbar)).toStrictEqual(-1);
        expect(fiftyHbar.comparedTo(zeroHbar)).toStrictEqual(1);
        expect(fiftyHbar.comparedTo(50, HbarUnit.Hbar)).toStrictEqual(0);

        expect(zeroHbar.isPositive()).toBe(true);
        expect(zeroHbar.isNegative()).toBe(false);
        expect(zeroHbar.isZero()).toBe(true);

        expect(negativeZeroHbar.isPositive()).toBe(false);
        expect(negativeZeroHbar.isNegative()).toBe(true);
        expect(negativeZeroHbar.isZero()).toBe(true);

        expect(fiftyHbar.isPositive()).toBe(true);
        expect(fiftyHbar.isNegative()).toBe(false);
        expect(fiftyHbar.isZero()).toBe(false);

        expect(negativeFiftyHbar.isPositive()).toBe(false);
        expect(negativeFiftyHbar.isNegative()).toBe(true);
        expect(negativeFiftyHbar.isZero()).toBe(false);
    });
});
