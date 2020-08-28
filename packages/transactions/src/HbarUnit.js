import Long from "long";

export default class HbarUnit {
    static Tinybar = new HbarUnit("tinybar");
    static Microbar = new HbarUnit("microbar");
    static Millibar = new HbarUnit("millibar");
    static Hbar = new HbarUnit("hbar");
    static Kilobar = new HbarUnit("kilobar");
    static Megabar = new HbarUnit("megabar");
    static Gigabar = new HbarUnit("gigabar");

    /**
     * @param {string} unit
     */
    constructor(unit) {
        /**
         * @type {string}
         */
        this._unit = unit;
    }

    /**
     * @returns {string}
     */
    getSymbol() {
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

    /**
     * @returns {Long}
     */
    _toTinybarCount() {
        switch (this._unit) {
            case "tinybar": return Long.fromNumber(1);
            case "microbar": return Long.fromNumber(100);
            case "millibar": return Long.fromNumber(100_000);
            case "hbar": return Long.fromNumber(100_000_000);
            case "kilobar": return Long.fromNumber(100_000_000).mul(1000);
            case "megabar": return Long.fromNumber(100_000_000).mul(1_000_000);
            case "gigabar": return Long.fromNumber(100_000_000).mul(1_000_000_000);
            default: throw new TypeError("HbarUnit was not a valid value");
        }
    }

    /**
     * @returns {string}
     */
    toString() {
        return this._unit;
    }
}
