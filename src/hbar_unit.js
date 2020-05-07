import BigNumber from "bignumber.js";

export class HbarUnit {
    /**
     * @param {string} unit
     */
    constructor(unit) {
        this._unit = unit;
    }

    /**
     * @returns {string}
     */
    getSymbol() {
        switch (this._unit) {
            case "tinybar":
                return "tℏ";
            case "microbar":
                return "μℏ";
            case "millibar":
                return "mℏ";
            case "hbar":
                return "ℏ";
            case "kilobar":
                return "kℏ";
            case "megabar":
                return "Mℏ";
            case "gigabar":
                return "Gℏ";
            default:
                throw new TypeError("HbarUnit was not a valid value");
        }
    }

    /**
     * @returns {BigNumber}
     */
    _toTinybarCount() {
        switch (this._unit) {
            case "tinybar":
                return new BigNumber(1);
            case "microbar":
                return new BigNumber(100);
            case "millibar":
                return new BigNumber(100000);
            case "hbar":
                return new BigNumber(100000000);
            case "kilobar":
                return new BigNumber(100000000).multipliedBy(1000);
            case "megabar":
                return new BigNumber(100000000).multipliedBy(1000000);
            case "gigabar":
                return new BigNumber(100000000).multipliedBy(1000000000);
            default:
                throw new TypeError("HbarUnit was not a valid value");
        }
    }

    /**
     * @returns {string}
     */
    toString() {
        return this._unit;
    }
}

HbarUnit.Tinybar = new HbarUnit("tinybar");
HbarUnit.Microbar = new HbarUnit("microbar");
HbarUnit.Millibar = new HbarUnit("millibar");
HbarUnit.Hbar = new HbarUnit("hbar");
HbarUnit.Kilobar = new HbarUnit("kilobar");
HbarUnit.Megabar = new HbarUnit("megabar");
HbarUnit.Gigabar = new HbarUnit("gigabar");
