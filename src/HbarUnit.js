import BigNumber from "bignumber.js";

export default class HbarUnit {
    /**
     * @internal
     * @param {string} name
     * @param {string} symbol
     * @param {BigNumber} tinybar
     */
    constructor(name, symbol, tinybar) {
        /**
         * @internal
         * @readonly
         */
        this._name = name;

        /**
         * @internal
         * @readonly
         */
        this._symbol = symbol;

        /**
         * @internal
         * @readonly
         */
        this._tinybar = tinybar;

        Object.freeze(this);
    }
}

HbarUnit.Tinybar = new HbarUnit("tinybar", "tℏ", new BigNumber(1));

HbarUnit.Microbar = new HbarUnit("microbar", "μℏ", new BigNumber(100));

HbarUnit.Millibar = new HbarUnit("millibar", "mℏ", new BigNumber(100000));

HbarUnit.Hbar = new HbarUnit("hbar", "ℏ", new BigNumber("100000000"));

HbarUnit.Kilobar = new HbarUnit(
    "kilobar",
    "kℏ",
    new BigNumber(1000).multipliedBy(new BigNumber("100000000"))
);

HbarUnit.Megabar = new HbarUnit(
    "megabar",
    "Mℏ",
    new BigNumber(1000000).multipliedBy(new BigNumber("100000000"))
);

HbarUnit.Gigabar = new HbarUnit(
    "gigabar",
    "Gℏ",
    new BigNumber("1000000000").multipliedBy(new BigNumber("100000000"))
);
