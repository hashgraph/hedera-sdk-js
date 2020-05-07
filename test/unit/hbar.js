import { Hbar } from "../../src/hbar";
import { HbarUnit } from "../../src/hbar_unit";
import BigNumber from "bignumber.js";

const fiftyGTinybar = new BigNumber(5000000000);
const fiftyHbar = Hbar.fromTinybar(fiftyGTinybar); // 50 hbar
const negativeFiftyGTinybar = new BigNumber(-5000000000);
const negativeFiftyHbar = Hbar.fromTinybar(fiftyGTinybar).negated(); // -50 hbar

const hundredHbar = Hbar.from(new BigNumber(10000000000), HbarUnit.Tinybar);

const zeroTinyBar = new BigNumber(0);
const zeroHbar = new Hbar(0);
const negativeZeroHbar = Hbar.from(-0, HbarUnit.Tinybar);

describe("hbar", function () {
    it("factory method checks", function () {
        expect(fiftyHbar.asTinybar()).to.deep.equal(fiftyGTinybar);
        expect(fiftyHbar.value()).to.deep.equal(new BigNumber(50));

        expect(new Hbar("50").asTinybar()).to.deep.equal(fiftyGTinybar);
        expect(Hbar.fromTinybar("5000000000").asTinybar()).to.deep.equal(
            fiftyGTinybar
        );
        expect(new Hbar(0).asTinybar()).to.deep.equal(zeroTinyBar);
    });

    it("value conversions are correct/50 hbar", function () {
        [
            [50000000, HbarUnit.Microbar],
            ["50000000", HbarUnit.Microbar],
            [50000, HbarUnit.Millibar],
            ["50000", HbarUnit.Millibar],
            [50, HbarUnit.Hbar],
            ["50", HbarUnit.Hbar],
            [0.05, HbarUnit.Kilobar],
            ["0.05", HbarUnit.Kilobar],
            [0.00005, HbarUnit.Megabar],
            ["0.00005", HbarUnit.Megabar],
            [0.00000005, HbarUnit.Gigabar],
            ["0.00000005", HbarUnit.Gigabar],
        ].forEach(([amount, unit]) => {
            expect(Hbar.from(amount, unit).value()).to.deep.equal(
                fiftyHbar.value()
            );

            expect(fiftyHbar.as(unit)).to.deep.equal(new BigNumber(amount));
        });
    });

    it("arithmetic works correctly", function () {
        expect(fiftyHbar.plus(fiftyHbar).asTinybar()).to.deep.equal(
            hundredHbar.asTinybar()
        );
        expect(
            fiftyHbar.plus(fiftyGTinybar, HbarUnit.Tinybar).asTinybar()
        ).to.deep.equal(hundredHbar.asTinybar());
        expect(fiftyHbar.plus(negativeFiftyHbar).asTinybar()).to.deep.equal(
            zeroHbar.asTinybar()
        );
        expect(fiftyHbar.plus(zeroHbar).asTinybar()).to.deep.equal(
            fiftyHbar.asTinybar()
        );
        expect(fiftyHbar.plus(negativeZeroHbar).asTinybar()).to.deep.equal(
            fiftyHbar.asTinybar()
        );

        expect(fiftyHbar.minus(fiftyHbar).asTinybar()).to.deep.equal(
            zeroHbar.asTinybar()
        );
        expect(
            fiftyHbar.minus(fiftyGTinybar, HbarUnit.Tinybar).asTinybar()
        ).to.deep.equal(zeroHbar.asTinybar());
        expect(fiftyHbar.minus(negativeFiftyHbar).asTinybar()).to.deep.equal(
            hundredHbar.asTinybar()
        );
        expect(fiftyHbar.minus(zeroHbar).asTinybar()).to.deep.equal(
            fiftyHbar.asTinybar()
        );
        expect(fiftyHbar.minus(negativeZeroHbar).asTinybar()).to.deep.equal(
            fiftyHbar.asTinybar()
        );

        expect(zeroHbar.minus(fiftyHbar).asTinybar()).to.deep.equal(
            negativeFiftyHbar.asTinybar()
        );
        expect(negativeZeroHbar.minus(fiftyHbar).asTinybar()).to.deep.equal(
            negativeFiftyHbar.asTinybar()
        );

        expect(fiftyHbar.negated().asTinybar()).to.deep.equal(
            fiftyGTinybar.negated()
        );
        expect(fiftyHbar.negated().isNegative()).to.be.true;
    });

    it("comparison works correctly", function () {
        expect(zeroHbar.isEqualTo(Hbar.ZERO)).to.be.true;
        expect(negativeZeroHbar.isEqualTo(Hbar.ZERO)).to.be.true;
        expect(zeroHbar.isEqualTo(negativeZeroHbar)).to.be.true;
        expect(fiftyHbar.isEqualTo(fiftyHbar)).to.be.true;
        expect(fiftyHbar.isEqualTo(fiftyGTinybar, HbarUnit.Tinybar)).to.be.true;
        expect(fiftyHbar.isEqualTo(50, HbarUnit.Hbar)).to.be.true;

        expect(fiftyHbar.isEqualTo(hundredHbar)).to.be.false;
        expect(fiftyHbar.isEqualTo(zeroHbar)).to.be.false;
        expect(fiftyHbar.isEqualTo(100, HbarUnit.Hbar)).to.be.false;
        expect(fiftyHbar.isEqualTo(500, HbarUnit.Hbar)).to.be.false;
        expect(fiftyHbar.isEqualTo(negativeFiftyHbar)).to.be.false;

        expect(fiftyHbar.isGreaterThan(hundredHbar)).to.be.false;
        expect(fiftyHbar.isGreaterThan(negativeFiftyHbar)).to.be.true;
        expect(fiftyHbar.isGreaterThan(10, HbarUnit.Hbar)).to.be.true;
        expect(fiftyHbar.isGreaterThan(negativeFiftyGTinybar, HbarUnit.Tinybar))
            .to.be.true;
        expect(fiftyHbar.isGreaterThan(fiftyHbar)).to.be.false;

        expect(fiftyHbar.isGreaterThanOrEqualTo(hundredHbar)).to.be.false;
        expect(fiftyHbar.isGreaterThanOrEqualTo(negativeFiftyHbar)).to.be.true;
        expect(fiftyHbar.isGreaterThanOrEqualTo(10, HbarUnit.Hbar)).to.be.true;
        expect(
            fiftyHbar.isGreaterThanOrEqualTo(
                negativeFiftyGTinybar,
                HbarUnit.Tinybar
            )
        ).to.be.true;
        expect(fiftyHbar.isGreaterThanOrEqualTo(fiftyHbar)).to.be.true;

        expect(fiftyHbar.isLessThan(hundredHbar)).to.be.true;
        expect(fiftyHbar.isLessThan(negativeFiftyHbar)).to.be.false;
        expect(fiftyHbar.isLessThan(10, HbarUnit.Hbar)).to.be.false;
        expect(fiftyHbar.isLessThan(negativeFiftyGTinybar, HbarUnit.Tinybar)).to
            .be.false;
        expect(fiftyHbar.isLessThan(fiftyHbar)).to.be.false;

        expect(fiftyHbar.isLessThanOrEqualTo(hundredHbar)).to.be.true;
        expect(fiftyHbar.isLessThanOrEqualTo(negativeFiftyHbar)).to.be.false;
        expect(fiftyHbar.isLessThanOrEqualTo(10, HbarUnit.Hbar)).to.be.false;
        expect(
            fiftyHbar.isLessThanOrEqualTo(
                negativeFiftyGTinybar,
                HbarUnit.Tinybar
            )
        ).to.be.false;
        expect(fiftyHbar.isLessThanOrEqualTo(fiftyHbar)).to.be.true;

        expect(fiftyHbar.comparedTo(fiftyHbar)).to.deep.equal(0);
        expect(fiftyHbar.comparedTo(hundredHbar)).to.deep.equal(-1);
        expect(fiftyHbar.comparedTo(zeroHbar)).to.deep.equal(1);
        expect(fiftyHbar.comparedTo(50, HbarUnit.Hbar)).to.deep.equal(0);

        expect(zeroHbar.isPositive()).to.be.true;
        expect(zeroHbar.isNegative()).to.be.false;
        expect(zeroHbar.isZero()).to.be.true;

        expect(negativeZeroHbar.isPositive()).to.be.false;
        expect(negativeZeroHbar.isNegative()).to.be.true;
        expect(negativeZeroHbar.isZero()).to.be.true;

        expect(fiftyHbar.isPositive()).to.be.true;
        expect(fiftyHbar.isNegative()).to.be.false;
        expect(fiftyHbar.isZero()).to.be.false;

        expect(negativeFiftyHbar.isPositive()).to.be.false;
        expect(negativeFiftyHbar.isNegative()).to.be.true;
        expect(negativeFiftyHbar.isZero()).to.be.false;
    });

    it("multipliedBy() works correctly", function () {
        expect(fiftyHbar.multipliedBy(2).asTinybar()).to.deep.equal(
            hundredHbar.asTinybar()
        );
        expect(fiftyHbar.multipliedBy(0).asTinybar()).to.deep.equal(
            zeroHbar.asTinybar()
        );
        expect(fiftyHbar.multipliedBy(-1).asTinybar()).to.deep.equal(
            fiftyHbar.negated().asTinybar()
        );
    });
});
