import BigNumber from "bignumber.js";
import { HbarRangeError } from "./errors/HbarRangeError";
import { HbarUnit } from "./HbarUnit";
import { UInt64Value } from "google-protobuf/google/protobuf/wrappers_pb";

export type Tinybar = BigNumber.Value;

const hbarTinybar = Symbol("hbarTinybar");

export const hbarToProto = Symbol("hbarToProto");

export const hbarToProtoValue = Symbol("hbarToProtoValue");

export const hbarCheck = Symbol("hbarCheck");

function convertToTinybar(amount: BigNumber.Value, unit: HbarUnit): BigNumber {
    const bnAmount = BigNumber.isBigNumber(amount) ? amount : new BigNumber(amount);
    return bnAmount.multipliedBy(unit._toTinybarCount());
}

const maxTinybar = new BigNumber(2).pow(63).minus(1);
const maxHbar = maxTinybar.dividedBy(HbarUnit.Hbar._toTinybarCount());

const minTinybar = new BigNumber(-2).pow(63);
const minHbar = minTinybar.dividedBy(HbarUnit.Hbar._toTinybarCount());

/**
 * Typesafe wrapper for values of HBAR providing foolproof conversions to other denominations.
 */
export class Hbar {
    /** The HBAR value in tinybar, used natively by the SDK and Hedera itself */
    private [hbarTinybar]: BigNumber;

    public constructor(amount: BigNumber.Value) {
        const bnAmount = amount instanceof BigNumber ? amount : new BigNumber(amount);

        if (bnAmount.isZero()) {
            this[ hbarTinybar ] = bnAmount;
        } else {
            this[ hbarTinybar ] = bnAmount.multipliedBy(HbarUnit.Hbar._toTinybarCount());
            this[ hbarCheck ]({ allowNegative: true });
        }

        // See `Hbar.fromTinybar()` as to why this is done
        if (typeof amount === "number" && amount >= 2 ** 53) {
            throw new HbarRangeError(this);
        }
    }

    public static readonly MAX: Hbar = new Hbar(maxHbar);

    public static readonly MIN: Hbar = new Hbar(minHbar);

    public static readonly ZERO: Hbar = new Hbar(0);

    /**
     * Calculate the HBAR amount given a raw value and a unit.
     */
    public static from(amount: BigNumber.Value, unit: HbarUnit): Hbar {
        const bnAmount = new BigNumber(amount);
        const hbar = new Hbar(0);
        hbar[ hbarTinybar ] = bnAmount.multipliedBy(unit._toTinybarCount());
        return hbar;
    }

    /** Get HBAR from a tinybar amount, may be a string */
    public static fromTinybar(amount: Tinybar): Hbar {
        const bnAmount = new BigNumber(amount);
        const hbar = new Hbar(0);
        hbar[ hbarTinybar ] = bnAmount;

        // Check if amount is out of range after hbar is constructed
        // Technically we're able to successfully construct Hbar from 2 ** 53,
        // but at that point the number is out of range for a js `number` type
        // so we throw an error to indicate this. If someone wants to use values
        // 2 ** 53 and higher then they shhould wrap the number in BigNumber.
        if (typeof amount === "number" && amount >= 2 ** 53) {
            throw new HbarRangeError(hbar);
        }

        return hbar;
    }

    /**
     * Wrap a raw value of HBAR, may be a string.
     * @deprecate Use constructor instead. `new Hbar(amount)`
     */
    public static of(amount: BigNumber.Value): Hbar {
        console.warn("`Hbar.of` is deprecated. Use `new Hbar(amount)` instead.");
        return new Hbar(amount);
    }

    // Create an Hbar with a value of 0 tinybar; Note that this is a positive signed zero
    //
    // @deprecate `Hbar.zero() is deprecated. If you want to use `Hbar.zero()` for
    // comparisions then use `Hbar.ZERO` static field, otherwise use `new Hbar(0)`.
    public static zero(): Hbar {
        console.warn(`\`Hbar.zero()\` is deprecated. If you want to use \`Hbar.zero()\` for 
comparisions then use \`Hbar.ZERO\` static field, otherwise use \`new Hbar(0)\``);
        return new Hbar(new BigNumber(0));
    }

    public toString(): string {
        return this.value().toString();
    }

    public value(): BigNumber {
        return this.as(HbarUnit.Hbar);
    }

    public asTinybar(): BigNumber {
        return this.as(HbarUnit.Tinybar);
    }

    public as(unit: HbarUnit): BigNumber {
        if (unit.toString() === HbarUnit.Tinybar.toString()) {
            return this[ hbarTinybar ];
        }

        return this[ hbarTinybar ].dividedBy(unit._toTinybarCount());
    }

    public multipliedBy(amount: BigNumber.Value): Hbar {
        return new Hbar(this[ hbarTinybar ].multipliedBy(amount)
            .dividedBy(HbarUnit.Hbar._toTinybarCount()));
    }

    public plus(hbar: Hbar): Hbar;
    public plus(amount: BigNumber.Value, unit: HbarUnit): Hbar;
    public plus(amount: Hbar | BigNumber.Value, unit?: HbarUnit): Hbar {
        return new Hbar((amount instanceof Hbar ?
            this[ hbarTinybar ].plus(amount[ hbarTinybar ]) :
            this[ hbarTinybar ].plus(convertToTinybar(amount, unit!))
        ).dividedBy(HbarUnit.Hbar._toTinybarCount()));
    }

    public minus(hbar: Hbar): Hbar;
    public minus(amount: BigNumber.Value, unit: HbarUnit): Hbar;
    public minus(amount: Hbar | BigNumber.Value, unit?: HbarUnit): Hbar {
        return new Hbar((amount instanceof Hbar ?
            this[ hbarTinybar ].minus(amount[ hbarTinybar ]) :
            this[ hbarTinybar ].minus(convertToTinybar(amount, unit!))
        ).dividedBy(HbarUnit.Hbar._toTinybarCount()));
    }

    public isEqualTo(hbar: Hbar): boolean;
    public isEqualTo(amount: BigNumber.Value, unit: HbarUnit): boolean;
    public isEqualTo(amount: Hbar | BigNumber.Value, unit?: HbarUnit): boolean {
        return amount instanceof Hbar ?
            this[ hbarTinybar ].isEqualTo(amount[ hbarTinybar ]) :
            this[ hbarTinybar ].isEqualTo(convertToTinybar(amount, unit!));
    }

    public isGreaterThan(hbar: Hbar): boolean;
    public isGreaterThan(amount: BigNumber.Value, unit: HbarUnit): boolean;
    public isGreaterThan(amount: Hbar | BigNumber.Value, unit?: HbarUnit): boolean {
        return amount instanceof Hbar ?
            this[ hbarTinybar ].isGreaterThan(amount[ hbarTinybar ]) :
            this[ hbarTinybar ].isGreaterThan(convertToTinybar(amount, unit!));
    }

    public isGreaterThanOrEqualTo(hbar: Hbar): boolean;
    public isGreaterThanOrEqualTo(amount: BigNumber.Value, unit: HbarUnit): boolean;
    public isGreaterThanOrEqualTo(amount: Hbar | BigNumber.Value, unit?: HbarUnit): boolean {
        return amount instanceof Hbar ?
            this[ hbarTinybar ].isGreaterThanOrEqualTo(amount[ hbarTinybar ]) :
            this[ hbarTinybar ].isGreaterThanOrEqualTo(convertToTinybar(amount, unit!));
    }

    public isLessThan(hbar: Hbar): boolean;
    public isLessThan(amount: BigNumber.Value, unit: HbarUnit): boolean;
    public isLessThan(amount: Hbar | BigNumber.Value, unit?: HbarUnit): boolean {
        return amount instanceof Hbar ?
            this[ hbarTinybar ].isLessThan(amount[ hbarTinybar ]) :
            this[ hbarTinybar ].isLessThan(convertToTinybar(amount, unit!));
    }

    public isLessThanOrEqualTo(hbar: Hbar): boolean;
    public isLessThanOrEqualTo(amount: BigNumber.Value, unit: HbarUnit): boolean;
    public isLessThanOrEqualTo(amount: Hbar | BigNumber.Value, unit?: HbarUnit): boolean {
        return amount instanceof Hbar ?
            this[ hbarTinybar ].isLessThanOrEqualTo(amount[ hbarTinybar ]) :
            this[ hbarTinybar ].isLessThanOrEqualTo(convertToTinybar(amount, unit!));
    }

    public comparedTo(hbar: Hbar): number;
    public comparedTo(amount: BigNumber.Value, unit: HbarUnit): number;
    public comparedTo(amount: Hbar | BigNumber.Value, unit?: HbarUnit): number {
        return amount instanceof Hbar ?
            this[ hbarTinybar ].comparedTo(amount[ hbarTinybar ]) :
            this[ hbarTinybar ].comparedTo(convertToTinybar(amount, unit!));
    }

    public isZero(): boolean {
        return this[ hbarTinybar ].isZero();
    }

    public negated(): Hbar {
        return Hbar.fromTinybar(this[ hbarTinybar ].negated());
    }

    public isNegative(): boolean {
        return this[ hbarTinybar ].isNegative();
    }

    public isPositive(): boolean {
        return this[ hbarTinybar ].isPositive();
    }

    public [ hbarCheck ]({ allowNegative }: { allowNegative: boolean }): void {
        const tinybar = this[ hbarTinybar ];
        if (tinybar.isNegative() && !allowNegative && tinybar.isLessThan(maxTinybar)) {
            throw new HbarRangeError(this);
        }

        if (tinybar.isGreaterThan(maxTinybar)) {
            throw new HbarRangeError(this);
        }
    }

    public [ hbarToProto ](): string {
        return String(this[ hbarTinybar ]);
    }

    public [ hbarToProtoValue ](): UInt64Value {
        const value = new UInt64Value();
        value.setValue(this[ hbarTinybar ].toNumber());
        return value;
    }
}

export function hbarFromTinybarOrHbar(number: Hbar | Tinybar): Hbar {
    if (number instanceof Hbar) {
        return number;
    }

    return Hbar.fromTinybar(new BigNumber(number));
}
