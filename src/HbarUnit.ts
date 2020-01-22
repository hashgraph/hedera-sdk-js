import BigNumber from "bignumber.js";

export class HbarUnit {
    public static readonly Tinybar = new HbarUnit("tinybar");
    public static readonly Microbar = new HbarUnit("microbar");
    public static readonly Millibar = new HbarUnit("millibar");
    public static readonly Hbar = new HbarUnit("hbar");
    public static readonly Kilobar = new HbarUnit("kilobar");
    public static readonly Megabar = new HbarUnit("megabar");
    public static readonly Gigabar = new HbarUnit("gigabar");

    private readonly _unit: string;

    private constructor(unit: string) {
        this._unit = unit;
    }

    public getSymbol(): string {
        switch (this._unit) {
            case "tinybar": return "tℏ";
            case "microbar": return "μℏ";
            case "millibar": return "mℏ";
            case "hbar": return "ℏ";
            case "kilobar": return "kℏ";
            case "megabar": return "Mℏ";
            case "gigabar": return "Gℏ";
            default: throw new TypeError("HbarUnit was not a valid value");
        }
    }

    public _toTinybarCount(): BigNumber {
        switch (this._unit) {
            case "tinybar": return new BigNumber(1);
            case "microbar": return new BigNumber(100);
            case "millibar": return new BigNumber(100_000);
            case "hbar": return new BigNumber(100_000_000);
            case "kilobar": return new BigNumber(100_000_000).multipliedBy(1000);
            case "megabar": return new BigNumber(100_000_000).multipliedBy(1_000_000);
            case "gigabar": return new BigNumber(100_000_000).multipliedBy(1_000_000_000);
            default: throw new TypeError("HbarUnit was not a valid value");
        }
    }

    public toString(): string {
        return this._unit;
    }
}
