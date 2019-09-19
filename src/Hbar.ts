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
    gigabar: hbarAsTinybar.multipliedBy(1_000_000_000),
};

function convertToTinybar(amount: BigNumber.Value, unit: HbarUnit): BigNumber {
    const bnAmount = amount instanceof BigNumber ? amount : new BigNumber(amount);
    return bnAmount.multipliedBy(tinybarConversions[unit]);
}

export type HbarUnit = keyof typeof tinybarConversions;

/** The possible denominations of HBAR in order by magnitude */
export const hbarUnits: HbarUnit[] = [
    'tinybar', 'microbar', 'millibar', 'hbar', 'kilobar', 'megabar', 'gigabar'
];

/** Symbols for denominations of HBAR for use in UIs */
export const hbarUnitSymbols = {
    tinybar: 'tℏ',
    microbar: 'μℏ',
    millibar: 'mℏ',
    hbar: 'ℏ',
    kilobar: 'kℏ',
    megabar: 'Mℏ',
    gigabar: 'Gℏ',
};

/**
 * Typesafe wrapper for values of HBAR providing foolproof conversions to other denominations.
 */
export class Hbar {
    /** The HBAR value in tinybar, used natively by the SDK and Hedera itself */
    private readonly tinybar: BigNumber;

    private constructor(tinybar: BigNumber) {
        this.tinybar = tinybar;
    }

    public static readonly MAX_VALUE: Hbar = new Hbar(new BigNumber(2).pow(63).minus(1));

    public static readonly MIN_VALUE: Hbar = new Hbar(new BigNumber(-2).pow(63));

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
        return new Hbar(convertToTinybar(amount, 'hbar'));
    }

    public value(): BigNumber {
        return this.as('hbar');
    }

    public asTinybar(): BigNumber {
        return this.as('tinybar');
    }

    public as(unit: HbarUnit): BigNumber {
        if (unit === 'tinybar') { return this.tinybar; }

        return this.tinybar.dividedBy(tinybarConversions[unit]);
    }

    public plus(hbar: Hbar): Hbar;
    public plus(amount: number | BigNumber, unit: HbarUnit): Hbar;
    public plus(amount: Hbar | number | BigNumber, unit?: HbarUnit): Hbar {
        if (amount instanceof Hbar) {
            return new Hbar(this.tinybar.plus(amount.tinybar));
        } else {
            return new Hbar(this.tinybar.plus(convertToTinybar(amount, unit!)));
        }
    }

    public minus(hbar: Hbar): Hbar;
    public minus(amount: number | BigNumber, unit: HbarUnit): Hbar;
    public minus(amount: Hbar | number | BigNumber, unit?: HbarUnit): Hbar {
        if (amount instanceof Hbar) {
            return new Hbar(this.tinybar.minus(amount.tinybar));
        } else {
            return new Hbar(this.tinybar.minus(convertToTinybar(amount, unit!)));
        }
    }

    public isEqualTo(hbar: Hbar): boolean;
    public isEqualTo(amount: number | BigNumber, unit: HbarUnit): boolean;
    public isEqualTo(amount: Hbar | number | BigNumber, unit?: HbarUnit): boolean {
        if (amount instanceof Hbar) {
            return this.tinybar.isEqualTo(amount.tinybar);
        } else {
            return this.tinybar.isEqualTo(convertToTinybar(amount, unit!));
        }
    }

    public comparedTo(hbar: Hbar): number;
    public comparedTo(amount: number | BigNumber, unit: HbarUnit): number;
    public comparedTo(amount: Hbar | number | BigNumber, unit?: HbarUnit): number {
        if (amount instanceof Hbar) {
            return this.tinybar.comparedTo(amount.tinybar);
        } else {
            return this.tinybar.comparedTo(convertToTinybar(amount, unit!));
        }
    }

    public negated(): Hbar {
        return new Hbar(this.tinybar.negated());
    }

    public isNegative(): boolean {
        return this.tinybar.isNegative();
    }
}
