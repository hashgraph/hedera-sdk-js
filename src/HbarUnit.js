/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2023 Hedera Hashgraph, LLC
 * ​
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ‍
 */

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

    /**
     * @param {string} unit
     * @returns {HbarUnit}
     */
    static fromString(unit) {
        switch (unit) {
            case HbarUnit.Hbar._symbol:
                return HbarUnit.Hbar;
            case HbarUnit.Tinybar._symbol:
                return HbarUnit.Tinybar;
            case HbarUnit.Microbar._symbol:
                return HbarUnit.Microbar;
            case HbarUnit.Millibar._symbol:
                return HbarUnit.Millibar;
            case HbarUnit.Kilobar._symbol:
                return HbarUnit.Kilobar;
            case HbarUnit.Megabar._symbol:
                return HbarUnit.Megabar;
            case HbarUnit.Gigabar._symbol:
                return HbarUnit.Gigabar;
            default:
                throw new Error("Unknown unit.");
        }
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
