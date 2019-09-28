import BigNumber from "bignumber.js";

const hbarAsTinybar = new BigNumber(100_000_000);

/** Multipliers of tinybar to other denominations */
export const tinybarConversions = {
    tinybar: 1,
    microbar: 100,
    millibar: 100_000,
    hbar: hbarAsTinybar,
    kilobar: hbarAsTinybar.multipliedBy(1000),
    megabar: hbarAsTinybar.multipliedBy(1_000_000),
    gigabar: hbarAsTinybar.multipliedBy(1_000_000_000)
};

function convertToTinybar(amount: BigNumber.Value, unit: HbarUnit): BigNumber {
    const bnAmount = amount instanceof BigNumber ? amount : new BigNumber(amount);
    return bnAmount.multipliedBy(tinybarConversions[ unit ]);
}

export type HbarUnit = keyof typeof tinybarConversions;

/** The possible denominations of HBAR in order by magnitude */
export const hbarUnits: HbarUnit[] = [ "tinybar", "microbar", "millibar", "hbar", "kilobar", "megabar", "gigabar" ];

/** Symbols for denominations of HBAR for use in UIs */
export const hbarUnitSymbols = {
    tinybar: "tℏ",
    microbar: "μℏ",
    millibar: "mℏ",
    hbar: "ℏ",
    kilobar: "kℏ",
    megabar: "Mℏ",
    gigabar: "Gℏ"
};

/**
 * Typesafe wrapper for values of HBAR providing foolproof conversions to other denominations.
 */
export class Hbar {
    /** The HBAR value in tinybar, used natively by the SDK and Hedera itself */
    private readonly _tinybar: BigNumber;

    private constructor(tinybar: BigNumber) {
        this._tinybar = tinybar;
    }

    public static readonly MAX_VALUE: Hbar = new Hbar(new BigNumber(2).pow(63).minus(1));

    public static readonly MIN_VALUE: Hbar = new Hbar(new BigNumber(-2).pow(63));

    public static readonly ZERO: Hbar = Hbar.zero();

    /**
     * Calculate the HBAR amount given a raw value and a unit.
     */
    public static from(amount: number | BigNumber | string, unit: HbarUnit): Hbar {
        return new Hbar(convertToTinybar(amount, unit));
    }

    /** Get HBAR from a tinybar amount, may be a string */
    public static fromTinybar(amount: number | BigNumber | string): Hbar {
        const bnAmount = amount instanceof BigNumber ? amount : new BigNumber(amount);
        return new Hbar(bnAmount);
    }

    /**
     * Wrap a raw value of HBAR, may be a string.
     */
    public static of(amount: number | BigNumber | string): Hbar {
        return new Hbar(convertToTinybar(amount, "hbar"));
    }

    /** Create an Hbar with a value of 0 tinybar; Note that this is a positive signed zero */
    public static zero(): Hbar {
        return new Hbar(new BigNumber(0));
    }

    public value(): BigNumber {
        return this.as("hbar");
    }

    public asTinybar(): BigNumber {
        return this.as("tinybar");
    }

    public as(unit: HbarUnit): BigNumber {
        if (unit === "tinybar") {
            return this._tinybar;
        }

        return this._tinybar.dividedBy(tinybarConversions[ unit ]);
    }

    public plus(hbar: Hbar): Hbar;
    public plus(amount: number | BigNumber, unit: HbarUnit): Hbar;
    public plus(amount: Hbar | number | BigNumber, unit?: HbarUnit): Hbar {
        return amount instanceof Hbar ? new Hbar(this._tinybar.plus(amount._tinybar)) : new Hbar(this._tinybar.plus(convertToTinybar(amount, unit!)));
    }

    public minus(hbar: Hbar): Hbar;
    public minus(amount: number | BigNumber, unit: HbarUnit): Hbar;
    public minus(amount: Hbar | number | BigNumber, unit?: HbarUnit): Hbar {
        return amount instanceof Hbar ?
            new Hbar(this._tinybar.minus(amount._tinybar)) :
            new Hbar(this._tinybar.minus(convertToTinybar(amount, unit!)));
    }

    public isEqualTo(hbar: Hbar): boolean;
    public isEqualTo(amount: number | BigNumber, unit: HbarUnit): boolean;
    public isEqualTo(amount: Hbar | number | BigNumber, unit?: HbarUnit): boolean {
        return amount instanceof Hbar ?
            this._tinybar.isEqualTo(amount._tinybar) :
            this._tinybar.isEqualTo(convertToTinybar(amount, unit!));
    }

    public isGreaterThan(hbar: Hbar): boolean;
    public isGreaterThan(amount: number | BigNumber, unit: HbarUnit): boolean;
    public isGreaterThan(amount: Hbar | number | BigNumber, unit?: HbarUnit): boolean {
        return amount instanceof Hbar ?
            this._tinybar.isGreaterThan(amount._tinybar) :
            this._tinybar.isGreaterThan(convertToTinybar(amount, unit!));
    }

    public isGreaterThanOrEqualTo(hbar: Hbar): boolean;
    public isGreaterThanOrEqualTo(amount: number | BigNumber, unit: HbarUnit): boolean;
    public isGreaterThanOrEqualTo(amount: Hbar | number | BigNumber, unit?: HbarUnit): boolean {
        return amount instanceof Hbar ?
            this._tinybar.isGreaterThanOrEqualTo(amount._tinybar) :
            this._tinybar.isGreaterThanOrEqualTo(convertToTinybar(amount, unit!));
    }

    public isLessThan(hbar: Hbar): boolean;
    public isLessThan(amount: number | BigNumber, unit: HbarUnit): boolean;
    public isLessThan(amount: Hbar | number | BigNumber, unit?: HbarUnit): boolean {
        return amount instanceof Hbar ?
            this._tinybar.isLessThan(amount._tinybar) :
            this._tinybar.isLessThan(convertToTinybar(amount, unit!));
    }

    public isLessThanOrEqualTo(hbar: Hbar): boolean;
    public isLessThanOrEqualTo(amount: number | BigNumber, unit: HbarUnit): boolean;
    public isLessThanOrEqualTo(amount: Hbar | number | BigNumber, unit?: HbarUnit): boolean {
        return amount instanceof Hbar ?
            this._tinybar.isLessThanOrEqualTo(amount._tinybar) :
            this._tinybar.isLessThanOrEqualTo(convertToTinybar(amount, unit!));
    }

    public comparedTo(hbar: Hbar): number;
    public comparedTo(amount: number | BigNumber, unit: HbarUnit): number;
    public comparedTo(amount: Hbar | number | BigNumber, unit?: HbarUnit): number {
        return amount instanceof Hbar ?
            this._tinybar.comparedTo(amount._tinybar) :
            this._tinybar.comparedTo(convertToTinybar(amount, unit!));
    }

    public isZero(): boolean {
        return this._tinybar.isZero();
    }

    public negated(): Hbar {
        return new Hbar(this._tinybar.negated());
    }

    public isNegative(): boolean {
        return this._tinybar.isNegative();
    }

    public isPositive(): boolean {
        return this._tinybar.isPositive();
    }
}
